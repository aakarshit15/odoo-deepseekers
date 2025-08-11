import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from .serializers import *
from .models import EmailOTP

User = get_user_model()


def send_otp_email(email, code, expires_at):
    subject = "QuickCourt — Your verification code"
    expires_str = expires_at.strftime("%I:%M %p")
    message = f"Your QuickCourt verification code is {code}. It expires at {expires_str}."
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@quickcourt.com")
    send_mail(subject, message, from_email, [email], fail_silently=False)


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp = EmailOTP.objects.filter(user=user, purpose='signup').order_by('-created_at').first()
        if otp:
            send_otp_email(user.email, otp.code, otp.expires_at)

        return Response({"detail": "User created. OTP sent to email."}, status=status.HTTP_201_CREATED)


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"email": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "No account with this email."}, status=status.HTTP_404_NOT_FOUND)

        code = f"{random.randint(100000, 999999):06d}"
        expires_at = timezone.now() + timedelta(minutes=10)
        EmailOTP.objects.create(user=user, code=code, expires_at=expires_at, purpose='signup')
        send_otp_email(user.email, code, expires_at)
        return Response({"detail": "OTP resent."}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp']

        otp.is_used = True
        otp.save()
        user.is_active = True
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user, context={'request': request}).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid or expired refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)


class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tokens = OutstandingToken.objects.filter(user=request.user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)
        return Response({"detail": "Logged out from all devices"}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Blacklist all tokens for this user after password change
        tokens = OutstandingToken.objects.filter(user=request.user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        return Response({"detail": "Password changed successfully. Please log in again."}, status=status.HTTP_200_OK)
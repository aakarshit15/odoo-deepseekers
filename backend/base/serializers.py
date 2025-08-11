from rest_framework import serializers
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
import random
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from base.models import *

User = get_user_model()

def _make_username_from_email(email):
    base = email.split('@')[0]
    candidate = base
    suffix = 0
    while User.objects.filter(username=candidate).exists():
        suffix += 1
        candidate = f"{base}{suffix}"
    return candidate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'avatar',
            'city', 'locality', 'full_address',
            'latitude', 'longitude', 'is_active'
        ]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'role', 'avatar',
            'city', 'locality', 'full_address', 'latitude', 'longitude'
        ]
        read_only_fields = ['id']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered. Try logging in or use resend-OTP.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        username = validated_data.get('username') or _make_username_from_email(validated_data['email'])
        user = User(**validated_data)
        user.username = username
        user.is_active = False  # wait until OTP verified
        user.set_password(password)
        user.save()
        # create and send OTP
        code = f"{random.randint(100000, 999999):06d}"
        expires_at = timezone.now() + timedelta(minutes=10)
        EmailOTP.objects.create(user=user, code=code, expires_at=expires_at, purpose='signup')
        return user


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get('email')
        code = attrs.get('code')
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")

        otp = EmailOTP.objects.filter(
            user=user, code=code, is_used=False, purpose='signup'
        ).order_by('-created_at').first()

        if not otp:
            raise serializers.ValidationError("Invalid code.")
        if otp.is_expired():
            raise serializers.ValidationError("OTP expired. Please request a new one.")
        attrs['user'] = user
        attrs['otp'] = otp
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        pw = attrs.get('password')
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.check_password(pw):
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account not active. Complete email verification.")
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        request = self.context.get('request')
        user = request.user
        if not user.check_password(attrs.get('old_password')):
            raise serializers.ValidationError({"old_password": "Wrong password."})
        if attrs.get('new_password') != attrs.get('new_password2'):
            raise serializers.ValidationError({"new_password2": "New passwords do not match."})
        return attrs

    def save(self, **kwargs):
        request = self.context.get('request')
        user = request.user
        user.set_password(self.validated_data['new_password'])
        user.save()

        # Invalidate all JWT refresh tokens for this user
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        return user


class SportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sport
        fields = ['id', 'name']


class VenuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenuePhoto
        fields = ['id', 'image']


class VenueShortSerializer(serializers.ModelSerializer):
    sports = SportSerializer(many=True)
    photos = VenuePhotoSerializer(many=True)

    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'city', 'locality',
            'starting_price_per_hour', 'rating',
            'popularity_score', 'sports', 'photos'
        ]


class VenueDetailSerializer(serializers.ModelSerializer):
    sports = SportSerializer(many=True)
    photos = VenuePhotoSerializer(many=True)

    class Meta:
        model = Venue
        fields = '__all__'


class CourtAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtAvailability
        fields = ['id', 'day_type', 'start_time', 'end_time', 'price_per_hour']


class CourtSerializer(serializers.ModelSerializer):
    sport = SportSerializer()
    availability = CourtAvailabilitySerializer(many=True)

    class Meta:
        model = Court
        fields = ['id', 'name', 'sport', 'price_per_hour', 'availability']


class BookingSerializer(serializers.ModelSerializer):
    court = CourtSerializer()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'court', 'date',
            'slot_start', 'slot_end', 'status', 'price', 'created_at'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'venue', 'rating', 'comment', 'created_at']


class BlockedSlotSerializer(serializers.ModelSerializer):
    court = CourtSerializer()

    class Meta:
        model = BlockedSlot
        fields = ['id', 'court', 'date', 'start_time', 'end_time', 'reason']


class ReportSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    venue = VenueShortSerializer(read_only=True)
    reported_user = UserSerializer(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'report_type', 'reported_by', 'venue',
            'reported_user', 'reason', 'created_at', 'is_resolved'
        ]
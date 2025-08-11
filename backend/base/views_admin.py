from django.db.models import Count, Sum, Q
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from datetime import date
from .models import *
from .serializers import *

class AdminDashboardView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_facility_owners = User.objects.filter(role='owner').count()
        total_bookings = Booking.objects.count()
        total_active_courts = Court.objects.count()

        booking_activity = (
            Booking.objects.values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        user_registrations = (
            User.objects.values('date_joined__date')
            .annotate(count=Count('id'))
            .order_by('date_joined__date')
        )

        facility_approval_trends = (
            Venue.objects.values('created_at__date')
            .annotate(
                approved=Count('id', filter=Q(is_approved=True)),
                pending=Count('id', filter=Q(is_approved=False))
            )
            .order_by('created_at__date')
        )

        most_active_sports = (
            Sport.objects.annotate(count=Count('venues__courts'))
            .values('name', 'count')
            .order_by('-count')[:5]
        )

        # Earnings from price_per_hour * hours booked
        total_earnings = 0
        for booking in Booking.objects.select_related('court'):
            availability = booking.court.availability.first()
            if availability:
                hours = (
                    (booking.slot_end.hour + booking.slot_end.minute / 60)
                    - (booking.slot_start.hour + booking.slot_start.minute / 60)
                )
                total_earnings += float(availability.price_per_hour) * hours

        earnings_simulation = round(total_earnings * 0.10, 2)

        return Response({
            "total_users": total_users,
            "total_facility_owners": total_facility_owners,
            "total_bookings": total_bookings,
            "total_active_courts": total_active_courts,
            "booking_activity": list(booking_activity),
            "user_registration_trends": list(user_registrations),
            "facility_approval_trends": list(facility_approval_trends),
            "most_active_sports": list(most_active_sports),
            "earnings_simulation": earnings_simulation
        })


class AdminPendingVenuesListView(generics.ListAPIView):
    serializer_class = VenueDetailSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Venue.objects.filter(is_approved=False)


class AdminApproveVenueView(generics.UpdateAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueDetailSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        venue = self.get_object()
        venue.is_approved = True
        venue.save()
        return Response({"detail": "Venue approved"})


class AdminRejectVenueView(generics.UpdateAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueDetailSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        venue = self.get_object()
        venue.is_approved = False
        venue.save()
        return Response({"detail": "Venue rejected"})


class AdminUsersListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        status = self.request.query_params.get('status')
        if role:
            queryset = queryset.filter(role=role)
        if status == 'active':
            queryset = queryset.filter(is_active=True)
        elif status == 'banned':
            queryset = queryset.filter(is_active=False)
        return queryset


class AdminBanUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"detail": "User banned"})


class AdminUnbanUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"detail": "User unbanned"})


class AdminUserBookingHistoryView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Booking.objects.filter(user_id=user_id)


class AdminReportsListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Report.objects.all()


class AdminResolveReportView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        report = self.get_object()
        report.is_resolved = True
        report.save()
        return Response({"detail": "Report resolved"})
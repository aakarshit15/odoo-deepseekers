from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, ExtractHour
from collections import defaultdict
from datetime import date
from .models import *
from .serializers import *

# --- Permissions ---
class IsFacilityOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'facility_owner'

    def has_object_permission(self, request, view, obj):
        return hasattr(obj, 'owner') and obj.owner == request.user


# 1. Add Venue
class OwnerVenueCreateView(generics.CreateAPIView):
    serializer_class = VenueDetailSerializer
    permission_classes = [IsFacilityOwner]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# 2. Edit Venue
class OwnerVenueUpdateView(generics.UpdateAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueDetailSerializer
    permission_classes = [IsFacilityOwner]

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)


# 3. Upload Venue Photos
class OwnerVenuePhotoUploadView(generics.CreateAPIView):
    serializer_class = VenuePhotoSerializer
    permission_classes = [IsFacilityOwner]

    def perform_create(self, serializer):
        venue = get_object_or_404(Venue, id=self.kwargs['venue_id'], owner=self.request.user)
        serializer.save(venue=venue)


# 4. Add Court
class OwnerCourtCreateView(generics.CreateAPIView):
    serializer_class = CourtSerializer
    permission_classes = [IsFacilityOwner]

    def perform_create(self, serializer):
        venue_id = self.request.data.get("venue_id")
        venue = get_object_or_404(Venue, id=venue_id, owner=self.request.user)
        serializer.save(venue=venue)


# 5. Edit Court
class OwnerCourtUpdateView(generics.UpdateAPIView):
    queryset = Court.objects.all()
    serializer_class = CourtSerializer
    permission_classes = [IsFacilityOwner]

    def get_queryset(self):
        return self.queryset.filter(venue__owner=self.request.user)


# 6. Add Availability
class OwnerAvailabilityCreateView(generics.CreateAPIView):
    serializer_class = CourtAvailabilitySerializer
    permission_classes = [IsFacilityOwner]

    def perform_create(self, serializer):
        court_id = self.kwargs['court_id']
        court = get_object_or_404(Court, id=court_id, venue__owner=self.request.user)
        serializer.save(court=court)


# 7. Edit Availability
class OwnerAvailabilityUpdateView(generics.UpdateAPIView):
    queryset = CourtAvailability.objects.all()
    serializer_class = CourtAvailabilitySerializer
    permission_classes = [IsFacilityOwner]

    def get_queryset(self):
        return self.queryset.filter(court__venue__owner=self.request.user)


# 8. Block Slot
class OwnerBlockSlotView(generics.CreateAPIView):
    serializer_class = BlockedSlotSerializer
    permission_classes = [IsFacilityOwner]

    def perform_create(self, serializer):
        court = get_object_or_404(Court, id=self.kwargs['court_id'], venue__owner=self.request.user)
        serializer.save(court=court)


# 9. View Bookings for My Courts
class OwnerBookingsListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsFacilityOwner]

    def get_queryset(self):
        return Booking.objects.filter(
            court__venue__owner=self.request.user
        ).select_related("user", "court")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)

        # Transform to match PDF spec
        transformed = []
        for item in serializer.data:
            transformed.append({
                "id": item["id"],
                "user_name": item["user"]["full_name"],
                "court_name": item["court"]["name"],
                "time": f"{item['slot_start']} - {item['slot_end']}",
                "status": item["status"]
            })

        return Response(transformed)


class OwnerDashboardView(generics.GenericAPIView):
    permission_classes = [IsFacilityOwner]

    def get(self, request):
        today = date.today()
        bookings = Booking.objects.filter(court__venue__owner=request.user)

        # --- KPI Counts ---
        total_bookings = bookings.count()
        active_courts = Court.objects.filter(venue__owner=request.user).count()
        earnings = bookings.aggregate(total=Sum('price'))['total'] or 0
        today_bookings = bookings.filter(date=today).count()

        # --- Calendar view (Bookings grouped by date) ---
        calendar = (
            bookings.values('date')
            .annotate(count=Count('id'), total_earnings=Sum('price'))
            .order_by('date')
        )

        # --- Daily Trends (last 30 days) ---
        daily_trends = (
            bookings.annotate(day=TruncDate('date'))
            .values('day')
            .annotate(count=Count('id'), earnings=Sum('price'))
            .order_by('day')
        )

        # --- Weekly Trends (last 12 weeks) ---
        weekly_trends = (
            bookings.annotate(week=TruncWeek('date'))
            .values('week')
            .annotate(count=Count('id'), earnings=Sum('price'))
            .order_by('week')
        )

        # --- Monthly Trends (last 12 months) ---
        monthly_trends = (
            bookings.annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(count=Count('id'), earnings=Sum('price'))
            .order_by('month')
        )

        # --- Earnings Summary (for chart) ---
        earnings_summary = {
            "daily": sum(item['earnings'] or 0 for item in daily_trends),
            "weekly": sum(item['earnings'] or 0 for item in weekly_trends),
            "monthly": sum(item['earnings'] or 0 for item in monthly_trends),
        }

        # --- Peak Booking Hours (heatmap data) ---
        peak_hours_data = (
            bookings.annotate(hour=ExtractHour('start_time'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        # Fill missing hours with 0 count
        peak_hours = defaultdict(int, {item['hour']: item['count'] for item in peak_hours_data})
        peak_hours_list = [{"hour": h, "count": peak_hours[h]} for h in range(0, 24)]

        return Response({
            "kpis": {
                "total_bookings": total_bookings,
                "active_courts": active_courts,
                "earnings": earnings,
                "today_bookings": today_bookings
            },
            "calendar": list(calendar),
            "trends": {
                "daily": list(daily_trends),
                "weekly": list(weekly_trends),
                "monthly": list(monthly_trends)
            },
            "earnings_summary": earnings_summary,
            "peak_hours": peak_hours_list
        })
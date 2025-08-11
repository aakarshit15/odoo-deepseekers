from django.contrib import admin
from .models import (
    User, EmailOTP, Sport, Venue, VenuePhoto, Court, CourtAvailability,
    Booking, BlockedSlot, Review, Report
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'city')
    list_filter = ('role', 'is_active', 'city')
    search_fields = ('username', 'email', 'city', 'locality')

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'purpose', 'created_at', 'expires_at', 'is_used')
    list_filter = ('purpose', 'is_used')

@admin.register(Sport)
class SportAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'city', 'is_approved', 'starting_price_per_hour', 'rating')
    list_filter = ('city', 'is_approved')
    search_fields = ('name', 'city', 'locality', 'owner__username')

@admin.register(VenuePhoto)
class VenuePhotoAdmin(admin.ModelAdmin):
    list_display = ('venue', 'id')

@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ('name', 'venue', 'sport')
    list_filter = ('sport',)
    search_fields = ('name', 'venue__name')

@admin.register(CourtAvailability)
class CourtAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('court', 'day_type', 'start_time', 'end_time', 'price_per_hour')
    list_filter = ('day_type',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'court', 'date', 'slot_start', 'slot_end', 'status', 'price')
    list_filter = ('status', 'date')
    search_fields = ('user__username', 'court__name', 'court__venue__name')

@admin.register(BlockedSlot)
class BlockedSlotAdmin(admin.ModelAdmin):
    list_display = ('court', 'date', 'start_time', 'end_time', 'reason')
    list_filter = ('date',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'venue', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'venue__name')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('reported_by', 'report_type', 'venue', 'reported_user', 'is_resolved', 'created_at')
    list_filter = ('report_type', 'is_resolved', 'created_at')
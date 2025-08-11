from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from django.utils import timezone
from datetime import timedelta
import random

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('owner', 'Facility Owner'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    avatar = CloudinaryField('avatar', blank=True, null=True, folder='quickcourt/avatars/')
    city = models.CharField(max_length=100)
    locality = models.CharField(max_length=100, blank=True)
    full_address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def __str__(self):
        return self.username
    
class EmailOTP(models.Model):
    """
    One-time email OTP for signup / verify / password reset (purpose field).
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='email_otps')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    purpose = models.CharField(max_length=20, default='signup')  # e.g. 'signup', 'password_reset'

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        status = "used" if self.is_used else "active"
        return f"{self.user.email} - {self.code} ({status})"


class Sport(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Venue(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='venues')
    name = models.CharField(max_length=200)
    description = models.TextField()
    city = models.CharField(max_length=100)
    locality = models.CharField(max_length=100, blank=True)
    full_address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    sports = models.ManyToManyField(Sport, related_name='venues')
    amenities = models.JSONField(default=list, blank=True)
    starting_price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    rating = models.DecimalField(max_digits=3, decimal_places=2, blank=True, null=True)
    popularity_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)  
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def update_popularity(self):
        total_bookings = self.bookings.count()
        rating_value = self.rating if self.rating else 0
        self.popularity_score = total_bookings * 0.7 + rating_value * 0.3
        self.save()

    def __str__(self):
        return self.name


class VenuePhoto(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='photos')
    image = CloudinaryField('venue_photo', folder='quickcourt/venues/')

    def __str__(self):
        return f"Photo for {self.venue.name}"


class Court(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='courts')
    name = models.CharField(max_length=100)
    sport = models.ForeignKey(Sport, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} - {self.venue.name}"


class CourtAvailability(models.Model):
    DAY_CHOICES = [
        ('mon_fri', 'Monday - Friday'),
        ('sat_sun', 'Saturday - Sunday'),
        ('holidays', 'Holidays'),
    ]
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='availability')
    day_type = models.CharField(max_length=20, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.court.name} - {self.day_type}"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    slot_start = models.TimeField()
    slot_end = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['court', 'date', 'slot_start', 'slot_end'],
                name='unique_court_booking'
            )
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        venue = self.court.venue
        venue.update_popularity()

    def __str__(self):
        return f"{self.user.username} - {self.court.name} - {self.date}"
    
class BlockedSlot(models.Model):
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name='blocked_slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['court', 'date', 'start_time', 'end_time'],
                name='unique_blocked_slot'
            )
        ]

    def __str__(self):
        return f"Blocked: {self.court.name} on {self.date}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'venue')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        venue = self.venue
        avg_rating = venue.reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0
        venue.rating = avg_rating
        venue.update_popularity()

    def __str__(self):
        return f"Review by {self.user.username} for {self.venue.name}"
    
class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('venue', 'Venue'),
        ('user', 'User'),
    ]
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, null=True, blank=True, related_name='reports')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='reports_received')
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Report by {self.reported_by.username} - {self.report_type}"
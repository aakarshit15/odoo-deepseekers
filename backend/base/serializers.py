from rest_framework import serializers
from base.models import *

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'avatar',
            'city', 'locality', 'full_address',
            'latitude', 'longitude', 'is_active'
        ]


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
            'slot_start', 'slot_end', 'status', 'created_at'
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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, pagination, status
from django.db.models import Count, Q, Min, Max
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *

class HomePageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        popular_venues = Venue.objects.filter(is_approved=True).order_by('-popularity_score')[:15]
        popular_venues_data = VenueShortSerializer(popular_venues, many=True, context={'request': request}).data

        popular_sports = Sport.objects.annotate(venue_count=Count('venues')).order_by('-venue_count')[:15]
        popular_sports_data = SportSerializer(popular_sports, many=True).data

        return Response({
            "popular_venues": popular_venues_data,
            "popular_sports": popular_sports_data
        })
    
class VenuesPagination(pagination.PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 50

class VenuesListView(generics.ListAPIView):
    serializer_class = VenueShortSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = VenuesPagination

    def get_queryset(self):
        qs = Venue.objects.all().prefetch_related('sports', 'photos')

        city = self.request.query_params.get('city')
        if not city and self.request.user.is_authenticated:
            city = self.request.user.city
        if city:
            qs = qs.filter(city__iexact=city)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)

        court_type = self.request.query_params.get('type')
        if court_type:
            qs = qs.filter(courts__type__iexact=court_type)

        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        if price_min:
            qs = qs.filter(starting_price_per_hour__gte=price_min)
        if price_max:
            qs = qs.filter(starting_price_per_hour__lte=price_max)

        sport_id = self.request.query_params.get('sport')
        if sport_id:
            qs = qs.filter(sports__id=sport_id)

        rating_min = self.request.query_params.get('rating_min')
        if rating_min:
            qs = qs.filter(rating__gte=rating_min)

        is_approved = self.request.query_params.get('is_approved')
        if is_approved is not None:
            if is_approved.lower() == 'true':
                qs = qs.filter(is_approved=True)
            elif is_approved.lower() == 'false':
                qs = qs.filter(is_approved=False)

        sort = self.request.query_params.get('sort')
        if sort == 'price_low':
            qs = qs.order_by('starting_price_per_hour')
        elif sort == 'price_high':
            qs = qs.order_by('-starting_price_per_hour')
        elif sort == 'popularity':
            qs = qs.order_by('-popularity_score')
        elif sort == 'rating':
            qs = qs.order_by('-rating')
        else:
            qs = qs.order_by('-popularity_score')

        return qs.distinct()

class VenueDetailView(generics.RetrieveAPIView):
    queryset = Venue.objects.prefetch_related('sports', 'photos', 'reviews__user')
    serializer_class = VenueDetailSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, *args, **kwargs):
        venue = self.get_object()
        venue_data = VenueDetailSerializer(venue, context={'request': request}).data

        reviews = Review.objects.filter(venue=venue).select_related('user').order_by('-created_at')
        reviews_data = ReviewSerializer(reviews, many=True, context={'request': request}).data

        return Response({
            "venue": venue_data,
            "reviews": reviews_data
        })
    
class SportPricingView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, venue_id, sport_id):
        venue = get_object_or_404(Venue, id=venue_id, is_approved=True)
        courts = Court.objects.filter(venue=venue, sport_id=sport_id).prefetch_related('availability')

        seen_specs = {}
        for court in courts:
            availability_specs = tuple(
                sorted(
                    (
                        avail.day_type,
                        str(avail.start_time),
                        str(avail.end_time),
                        float(avail.price_per_hour)
                    )
                    for avail in court.availability.all()
                )
            )

            if availability_specs not in seen_specs:
                seen_specs[availability_specs] = {
                    "court_names": [court.name],
                    "availability": [
                        {
                            "day_type": avail.get_day_type_display(),
                            "start_time": avail.start_time,
                            "end_time": avail.end_time,
                            "price_per_hour": avail.price_per_hour
                        }
                        for avail in court.availability.all()
                    ]
                }
            else:
                seen_specs[availability_specs]["court_names"].append(court.name)

        pricing_data = []
        for spec, data in seen_specs.items():
            pricing_data.append({
                "court_names": ", ".join(data["court_names"]),
                "availability": data["availability"]
            })

        return Response({
            "venue": {
                "id": venue.id,
                "name": venue.name,
                "city": venue.city,
                "locality": venue.locality
            },
            "sport_id": sport_id,
            "pricing": pricing_data
        })
    
class IsReviewOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class ReviewCreateView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        venue_id = kwargs.get('venue_id')
        venue = get_object_or_404(Venue, id=venue_id, is_approved=True)

        if Review.objects.filter(user=request.user, venue=venue).exists():
            return Response({"detail": "You have already reviewed this venue."}, status=status.HTTP_400_BAD_REQUEST)

        rating = request.data.get('rating')
        if not rating:
            return Response({"detail": "Rating is required."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, venue=venue)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReviewUpdateView(generics.UpdateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsReviewOwner]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

class ReviewDeleteView(generics.DestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated, IsReviewOwner]

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)
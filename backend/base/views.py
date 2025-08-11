from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, pagination
from django.db.models import Count, Q, Min, Max
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

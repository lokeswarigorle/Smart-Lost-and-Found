import math
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from items.models import LostItem, FoundItem
from matching.services import haversine_distance_km

class NearbyItemsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat_param = request.query_params.get('lat')
        lon_param = request.query_params.get('lon')
        radius = float(request.query_params.get('radius', 25.0)) # km
        item_type = request.query_params.get('type', 'all') # 'all', 'lost', 'found'
        category = request.query_params.get('category')
        city = request.query_params.get('city')
        query = request.query_params.get('q')

        center_lat = float(lat_param) if lat_param else None
        center_lon = float(lon_param) if lon_param else None

        results = []

        # 1. Lost items
        if item_type in ['all', 'lost']:
            lost_qs = LostItem.objects.exclude(status='recovered')
            if category:
                lost_qs = lost_qs.filter(category=category)
            if city:
                lost_qs = lost_qs.filter(city__icontains=city)
            if query:
                lost_qs = lost_qs.filter(title__icontains=query)

            for item in lost_qs:
                if item.latitude is not None and item.longitude is not None:
                    lat_val = float(item.latitude)
                    lon_val = float(item.longitude)
                    dist = haversine_distance_km(center_lat, center_lon, lat_val, lon_val) if (center_lat and center_lon) else None

                    if dist is None or dist <= radius:
                        results.append({
                            'id': item.id,
                            'type': 'lost',
                            'title': item.title,
                            'category': item.category,
                            'category_display': item.get_category_display(),
                            'description': item.description[:120] + '...' if len(item.description) > 120 else item.description,
                            'primary_color': item.primary_color,
                            'date': str(item.date_lost),
                            'city': item.city,
                            'area': item.area,
                            'location_name': item.location_name,
                            'latitude': lat_val,
                            'longitude': lon_val,
                            'distance_km': round(dist, 2) if dist is not None else None,
                            'image_url': item.image.url if item.image else None,
                            'status': item.status,
                            'status_display': item.get_status_display(),
                        })

        # 2. Found items
        if item_type in ['all', 'found']:
            found_qs = FoundItem.objects.exclude(status='closed')
            if category:
                found_qs = found_qs.filter(category=category)
            if city:
                found_qs = found_qs.filter(city__icontains=city)
            if query:
                found_qs = found_qs.filter(title__icontains=query)

            for item in found_qs:
                if item.latitude is not None and item.longitude is not None:
                    lat_val = float(item.latitude)
                    lon_val = float(item.longitude)
                    dist = haversine_distance_km(center_lat, center_lon, lat_val, lon_val) if (center_lat and center_lon) else None

                    if dist is None or dist <= radius:
                        results.append({
                            'id': item.id,
                            'type': 'found',
                            'title': item.title,
                            'category': item.category,
                            'category_display': item.get_category_display(),
                            'description': item.description[:120] + '...' if len(item.description) > 120 else item.description,
                            'primary_color': item.primary_color,
                            'date': str(item.date_found),
                            'city': item.city,
                            'area': item.area,
                            'location_name': item.found_location,
                            'latitude': lat_val,
                            'longitude': lon_val,
                            'distance_km': round(dist, 2) if dist is not None else None,
                            'image_url': item.image.url if item.image else None,
                            'status': item.status,
                            'status_display': item.get_status_display(),
                        })

        # Sort by distance if center was provided
        if center_lat and center_lon:
            results.sort(key=lambda x: x['distance_km'] if x['distance_km'] is not None else float('inf'))

        return Response({
            'count': len(results),
            'radius_km': radius,
            'center': {'lat': center_lat, 'lon': center_lon} if (center_lat and center_lon) else None,
            'items': results
        }, status=status.HTTP_200_OK)

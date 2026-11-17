from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q
from .models import LostItem, FoundItem, ItemImage
from .serializers import LostItemSerializer, FoundItemSerializer, ItemImageSerializer

class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        user = getattr(obj, 'user', getattr(obj, 'finder', None))
        return user == request.user or request.user.is_staff or getattr(request.user, 'role', '') == 'admin'

class LostItemListCreateView(generics.ListCreateAPIView):
    serializer_class = LostItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'city', 'area', 'location_name', 'primary_color']

    def get_queryset(self):
        qs = LostItem.objects.all().select_related('user').prefetch_related('additional_images')
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('city')
        status_param = self.request.query_params.get('status')
        color = self.request.query_params.get('color')
        my_reports = self.request.query_params.get('my_reports')

        if category:
            qs = qs.filter(category=category)
        if city:
            qs = qs.filter(city__icontains=city)
        if status_param:
            qs = qs.filter(status=status_param)
        if color:
            qs = qs.filter(Q(primary_color__icontains=color) | Q(secondary_color__icontains=color))
        if my_reports and self.request.user.is_authenticated:
            qs = qs.filter(user=self.request.user)

        return qs

    def perform_create(self, serializer):
        item = serializer.save(user=self.request.user)
        # Attempt AI match generation safely
        try:
            from matching.services import run_match_for_lost_item
            run_match_for_lost_item(item)
        except Exception as e:
            # Do not fail item creation if matcher hits an issue
            pass

class LostItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LostItem.objects.all().select_related('user').prefetch_related('additional_images')
    serializer_class = LostItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsOwnerOrAdminOrReadOnly]

class FoundItemListCreateView(generics.ListCreateAPIView):
    serializer_class = FoundItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'city', 'area', 'found_location', 'primary_color']

    def get_queryset(self):
        qs = FoundItem.objects.all().select_related('finder').prefetch_related('additional_images')
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('city')
        status_param = self.request.query_params.get('status')
        color = self.request.query_params.get('color')
        my_reports = self.request.query_params.get('my_reports')

        if category:
            qs = qs.filter(category=category)
        if city:
            qs = qs.filter(city__icontains=city)
        if status_param:
            qs = qs.filter(status=status_param)
        if color:
            qs = qs.filter(Q(primary_color__icontains=color) | Q(secondary_color__icontains=color))
        if my_reports and self.request.user.is_authenticated:
            qs = qs.filter(finder=self.request.user)

        return qs

    def perform_create(self, serializer):
        item = serializer.save(finder=self.request.user)
        try:
            from matching.services import run_match_for_found_item
            run_match_for_found_item(item)
        except Exception as e:
            pass

class FoundItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FoundItem.objects.all().select_related('finder').prefetch_related('additional_images')
    serializer_class = FoundItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsOwnerOrAdminOrReadOnly]

class ItemImageUploadView(generics.CreateAPIView):
    serializer_class = ItemImageSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        lost_item_id = self.request.data.get('lost_item')
        found_item_id = self.request.data.get('found_item')
        lost_item = LostItem.objects.filter(id=lost_item_id, user=self.request.user).first() if lost_item_id else None
        found_item = FoundItem.objects.filter(id=found_item_id, finder=self.request.user).first() if found_item_id else None
        serializer.save(lost_item=lost_item, found_item=found_item)

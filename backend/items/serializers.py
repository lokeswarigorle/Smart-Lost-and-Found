from rest_framework import serializers
from .models import LostItem, FoundItem, ItemImage
from accounts.serializers import UserSerializer

class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ['id', 'image', 'caption', 'uploaded_at']

class LostItemSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    additional_images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = LostItem
        fields = [
            'id', 'user', 'title', 'category', 'category_display',
            'description', 'primary_color', 'secondary_color',
            'date_lost', 'location_name', 'city', 'area',
            'latitude', 'longitude', 'image', 'contact_preference',
            'status', 'status_display', 'is_resolved',
            'additional_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate_image(self, value):
        # Validate image file size: max 10MB
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Image file size cannot exceed 10MB.")
        return value

class FoundItemSerializer(serializers.ModelSerializer):
    finder = UserSerializer(read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    additional_images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = FoundItem
        fields = [
            'id', 'finder', 'title', 'category', 'category_display',
            'description', 'primary_color', 'secondary_color',
            'date_found', 'found_location', 'city', 'area',
            'latitude', 'longitude', 'storage_location',
            'image', 'contact_preference', 'status', 'status_display',
            'additional_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'finder', 'created_at', 'updated_at']

    def validate_image(self, value):
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Image file size cannot exceed 10MB.")
        return value

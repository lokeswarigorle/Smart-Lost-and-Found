from rest_framework import serializers
from .models import MatchRecord, ItemEmbedding
from items.serializers import LostItemSerializer, FoundItemSerializer

class MatchRecordSerializer(serializers.ModelSerializer):
    lost_item = LostItemSerializer(read_only=True)
    found_item = FoundItemSerializer(read_only=True)
    confidence_display = serializers.CharField(source='get_confidence_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = MatchRecord
        fields = [
            'id', 'lost_item', 'found_item',
            'image_similarity', 'category_similarity', 'color_similarity',
            'description_similarity', 'location_similarity',
            'combined_score', 'confidence_level', 'confidence_display',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

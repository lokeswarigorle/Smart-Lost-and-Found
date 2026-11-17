from django.contrib import admin
from .models import MatchRecord, ItemEmbedding

@admin.register(MatchRecord)
class MatchRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'lost_item', 'found_item', 'combined_score', 'image_similarity', 'confidence_level', 'status', 'created_at')
    list_filter = ('confidence_level', 'status')
    search_fields = ('lost_item__title', 'found_item__title')

@admin.register(ItemEmbedding)
class ItemEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('id', 'lost_item', 'found_item', 'model_name', 'embedding_dim', 'created_at')

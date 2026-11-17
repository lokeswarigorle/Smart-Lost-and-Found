from django.contrib import admin
from .models import LostItem, FoundItem, ItemImage

class ItemImageInline(admin.TabularInline):
    model = ItemImage
    extra = 1

@admin.register(LostItem)
class LostItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'user', 'city', 'date_lost', 'status', 'created_at')
    list_filter = ('category', 'status', 'city')
    search_fields = ('title', 'description', 'city', 'user__username')
    inlines = [ItemImageInline]

@admin.register(FoundItem)
class FoundItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'finder', 'city', 'date_found', 'status', 'created_at')
    list_filter = ('category', 'status', 'city')
    search_fields = ('title', 'description', 'city', 'finder__username')
    inlines = [ItemImageInline]

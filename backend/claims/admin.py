from django.contrib import admin
from .models import ClaimRequest

@admin.register(ClaimRequest)
class ClaimRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'claimant', 'found_item', 'status', 'reviewed_by', 'decision_date', 'created_at')
    list_filter = ('status',)
    search_fields = ('claimant__username', 'found_item__title', 'unique_identifying_features', 'serial_number')

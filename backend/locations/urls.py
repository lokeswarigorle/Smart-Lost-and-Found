from django.urls import path
from .views import NearbyItemsView

urlpatterns = [
    path('items/nearby/', NearbyItemsView.as_view(), name='nearby_items'),
]

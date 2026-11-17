from django.urls import path
from .views import (
    LostItemListCreateView,
    LostItemDetailView,
    FoundItemListCreateView,
    FoundItemDetailView,
    ItemImageUploadView
)

urlpatterns = [
    path('lost-items/', LostItemListCreateView.as_view(), name='lost_items_list_create'),
    path('lost-items/<int:pk>/', LostItemDetailView.as_view(), name='lost_items_detail'),
    path('found-items/', FoundItemListCreateView.as_view(), name='found_items_list_create'),
    path('found-items/<int:pk>/', FoundItemDetailView.as_view(), name='found_items_detail'),
    path('item-images/', ItemImageUploadView.as_view(), name='item_images_upload'),
]

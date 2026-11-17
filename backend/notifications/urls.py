from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notifications_list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification_mark_read'),
    path('notifications/mark-all-read/', MarkAllNotificationsReadView.as_view(), name='notifications_mark_all_read'),
]

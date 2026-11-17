from django.urls import path
from .views import AdminDashboardStatsView, UserDashboardStatsView

urlpatterns = [
    path('dashboard/admin/', AdminDashboardStatsView.as_view(), name='dashboard_admin_stats'),
    path('dashboard/user/', UserDashboardStatsView.as_view(), name='dashboard_user_stats'),
]

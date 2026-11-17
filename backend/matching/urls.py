from django.urls import path
from .views import MatchListView, MatchDetailView, GenerateMatchesView, MatchRespondView

urlpatterns = [
    path('matches/', MatchListView.as_view(), name='matches_list'),
    path('matches/generate/', GenerateMatchesView.as_view(), name='matches_generate'),
    path('matches/<int:pk>/', MatchDetailView.as_view(), name='matches_detail'),
    path('matches/<int:pk>/respond/', MatchRespondView.as_view(), name='matches_respond'),
]

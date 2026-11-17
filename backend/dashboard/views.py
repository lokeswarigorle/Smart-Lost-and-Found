from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.contrib.auth import get_user_model
from django.db.models import Count
from items.models import LostItem, FoundItem
from matching.models import MatchRecord
from claims.models import ClaimRequest
from notifications.models import Notification

User = get_user_model()

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_lost = LostItem.objects.count()
        active_lost = LostItem.objects.filter(status__in=['reported', 'matched']).count()
        recovered_lost = LostItem.objects.filter(status='recovered').count()

        total_found = FoundItem.objects.count()
        available_found = FoundItem.objects.filter(status='available').count()
        handed_over_found = FoundItem.objects.filter(status__in=['handed_over', 'closed']).count()

        total_matches = MatchRecord.objects.count()
        high_confidence_matches = MatchRecord.objects.filter(confidence_level='high').count()

        pending_claims = ClaimRequest.objects.filter(status='pending').count()
        under_review_claims = ClaimRequest.objects.filter(status='under_review').count()
        approved_claims = ClaimRequest.objects.filter(status='approved').count()
        rejected_claims = ClaimRequest.objects.filter(status='rejected').count()
        resolved_cases = ClaimRequest.objects.filter(status='resolved').count() + recovered_lost

        # Category breakdown
        category_breakdown = list(
            LostItem.objects.values('category').annotate(count=Count('category')).order_by('-count')[:5]
        )

        # Monthly trends (recent 5 items)
        recent_lost = list(LostItem.objects.values('id', 'title', 'category', 'city', 'status', 'created_at')[:5])
        recent_found = list(FoundItem.objects.values('id', 'title', 'category', 'city', 'status', 'created_at')[:5])
        recent_claims = list(ClaimRequest.objects.values(
            'id', 'claimant__username', 'found_item__title', 'status', 'created_at'
        )[:5])

        return Response({
            'overview': {
                'total_users': total_users,
                'total_lost_items': total_lost,
                'active_lost_items': active_lost,
                'recovered_lost_items': recovered_lost,
                'total_found_items': total_found,
                'available_found_items': available_found,
                'handed_over_found_items': handed_over_found,
                'total_possible_matches': total_matches,
                'high_confidence_matches': high_confidence_matches,
                'pending_claims': pending_claims,
                'under_review_claims': under_review_claims,
                'approved_claims': approved_claims,
                'rejected_claims': rejected_claims,
                'resolved_cases': resolved_cases,
            },
            'category_breakdown': category_breakdown,
            'recent_lost': recent_lost,
            'recent_found': recent_found,
            'recent_claims': recent_claims,
        }, status=status.HTTP_200_OK)

class UserDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        my_lost_count = LostItem.objects.filter(user=user).count()
        my_lost_active = LostItem.objects.filter(user=user, status__in=['reported', 'matched']).count()
        my_lost_recovered = LostItem.objects.filter(user=user, status='recovered').count()

        my_found_count = FoundItem.objects.filter(finder=user).count()
        my_found_available = FoundItem.objects.filter(finder=user, status='available').count()

        my_claims_submitted = ClaimRequest.objects.filter(claimant=user).count()
        my_claims_pending = ClaimRequest.objects.filter(claimant=user, status='pending').count()
        my_claims_approved = ClaimRequest.objects.filter(claimant=user, status='approved').count()

        claims_received_count = ClaimRequest.objects.filter(found_item__finder=user).count()
        claims_received_pending = ClaimRequest.objects.filter(found_item__finder=user, status='pending').count()

        my_matches_count = MatchRecord.objects.filter(
            lost_item__user=user
        ).count() + MatchRecord.objects.filter(
            found_item__finder=user
        ).count()

        unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()

        return Response({
            'my_lost_items': my_lost_count,
            'my_lost_active': my_lost_active,
            'my_lost_recovered': my_lost_recovered,
            'my_found_items': my_found_count,
            'my_found_available': my_found_available,
            'my_claims_submitted': my_claims_submitted,
            'my_claims_pending': my_claims_pending,
            'my_claims_approved': my_claims_approved,
            'claims_received_count': claims_received_count,
            'claims_received_pending': claims_received_pending,
            'my_matches_count': my_matches_count,
            'unread_notifications': unread_notifications,
        }, status=status.HTTP_200_OK)

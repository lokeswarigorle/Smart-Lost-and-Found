from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from django.db.models import Q
from .models import ClaimRequest
from .serializers import (
    ClaimRequestSerializer,
    ClaimRequestCreateSerializer,
    ClaimStatusUpdateSerializer
)
from notifications.services import create_claim_notification, create_claim_decision_notification

class ClaimListCreateView(generics.ListCreateAPIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClaimRequestCreateSerializer
        return ClaimRequestSerializer

    def get_queryset(self):
        user = self.request.user
        status_param = self.request.query_params.get('status')
        as_finder = self.request.query_params.get('as_finder')

        if user.is_staff or getattr(user, 'role', '') == 'admin':
            qs = ClaimRequest.objects.all()
        elif as_finder:
            qs = ClaimRequest.objects.filter(found_item__finder=user)
        else:
            qs = ClaimRequest.objects.filter(
                Q(claimant=user) | Q(found_item__finder=user)
            )

        if status_param:
            qs = qs.filter(status=status_param)

        return qs.select_related('claimant', 'found_item', 'lost_item', 'reviewed_by')

    def perform_create(self, serializer):
        claim = serializer.save()
        # Mark found item as claimed
        found_item = claim.found_item
        if found_item.status == 'available':
            found_item.status = 'claimed'
            found_item.save(update_fields=['status'])

        # Notify finder
        try:
            create_claim_notification(claim)
        except Exception:
            pass

class ClaimDetailView(generics.RetrieveAPIView):
    serializer_class = ClaimRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return ClaimRequest.objects.all()
        return ClaimRequest.objects.filter(
            Q(claimant=user) | Q(found_item__finder=user)
        )

class ClaimStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        claim = ClaimRequest.objects.filter(id=pk).select_related('found_item', 'lost_item', 'claimant').first()
        if not claim:
            return Response({'error': 'Claim not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_finder = claim.found_item.finder == user

        if not is_admin and not is_finder:
            return Response(
                {'error': 'Only the finder or an administrator can review and update this claim.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')

        valid_transitions = ['under_review', 'approved', 'rejected', 'resolved']
        if new_status not in valid_transitions:
            return Response(
                {'error': f"Invalid status '{new_status}'. Must be one of {valid_transitions}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        claim.status = new_status
        claim.admin_notes = admin_notes
        claim.reviewed_by = user
        claim.decision_date = timezone.now()
        claim.save()

        # Update associated items based on decision
        if new_status == 'approved':
            claim.found_item.status = 'handed_over'
            claim.found_item.save(update_fields=['status'])
            if claim.lost_item:
                claim.lost_item.status = 'recovered'
                claim.lost_item.is_resolved = True
                claim.lost_item.save(update_fields=['status', 'is_resolved'])
            create_claim_decision_notification(claim, 'approved')

        elif new_status == 'rejected':
            # If no other pending/approved claims, revert found item to available
            remaining_claims = ClaimRequest.objects.filter(
                found_item=claim.found_item,
                status__in=['pending', 'under_review', 'approved']
            ).exclude(id=claim.id).exists()
            if not remaining_claims:
                claim.found_item.status = 'available'
                claim.found_item.save(update_fields=['status'])
            create_claim_decision_notification(claim, 'rejected')

        elif new_status == 'resolved':
            claim.found_item.status = 'closed'
            claim.found_item.save(update_fields=['status'])
            if claim.lost_item:
                claim.lost_item.status = 'recovered'
                claim.lost_item.is_resolved = True
                claim.lost_item.save(update_fields=['status', 'is_resolved'])

        serializer = ClaimRequestSerializer(claim, context={'request': request})
        return Response({
            'message': f"Claim #{claim.id} updated to {claim.get_status_display()}.",
            'claim': serializer.data
        }, status=status.HTTP_200_OK)

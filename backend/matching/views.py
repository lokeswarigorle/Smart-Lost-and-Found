from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import MatchRecord
from .serializers import MatchRecordSerializer
from .services import run_match_for_lost_item, run_match_for_found_item
from items.models import LostItem, FoundItem

class MatchListView(generics.ListAPIView):
    serializer_class = MatchRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        lost_id = self.request.query_params.get('lost_item')
        found_id = self.request.query_params.get('found_item')
        confidence = self.request.query_params.get('confidence')

        # Admins can view all matches; regular users see matches involving their own items
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            qs = MatchRecord.objects.all()
        else:
            qs = MatchRecord.objects.filter(
                Q(lost_item__user=user) | Q(found_item__finder=user)
            )

        if lost_id:
            qs = qs.filter(lost_item_id=lost_id)
        if found_id:
            qs = qs.filter(found_item_id=found_id)
        if confidence:
            qs = qs.filter(confidence_level=confidence)

        return qs.select_related('lost_item', 'found_item', 'lost_item__user', 'found_item__finder')

class MatchDetailView(generics.RetrieveAPIView):
    serializer_class = MatchRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return MatchRecord.objects.all()
        return MatchRecord.objects.filter(
            Q(lost_item__user=user) | Q(found_item__finder=user)
        )

class GenerateMatchesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lost_item_id = request.data.get('lost_item_id')
        found_item_id = request.data.get('found_item_id')

        if not lost_item_id and not found_item_id:
            return Response(
                {'error': 'Either lost_item_id or found_item_id must be provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        matches = []
        if lost_item_id:
            lost_item = LostItem.objects.filter(id=lost_item_id).first()
            if not lost_item:
                return Response({'error': 'Lost item not found.'}, status=status.HTTP_404_NOT_FOUND)
            matches = run_match_for_lost_item(lost_item)
        elif found_item_id:
            found_item = FoundItem.objects.filter(id=found_item_id).first()
            if not found_item:
                return Response({'error': 'Found item not found.'}, status=status.HTTP_404_NOT_FOUND)
            matches = run_match_for_found_item(found_item)

        serializer = MatchRecordSerializer(matches, many=True)
        return Response({
            'message': f"Evaluated and generated {len(matches)} match results.",
            'matches': serializer.data
        }, status=status.HTTP_200_OK)

class MatchRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        match_record = MatchRecord.objects.filter(id=pk).first()
        if not match_record:
            return Response({'error': 'Match record not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if match_record.lost_item.user != user and match_record.found_item.finder != user and not user.is_staff:
            return Response({'error': 'Unauthorized to respond to this match.'}, status=status.HTTP_403_FORBIDDEN)

        response_action = request.data.get('action') # 'confirm', 'dismiss', 'initiate_claim'
        if response_action == 'confirm':
            match_record.status = 'confirmed_by_user'
        elif response_action == 'dismiss':
            match_record.status = 'rejected_by_user'
        elif response_action == 'initiate_claim':
            match_record.status = 'claim_initiated'
        else:
            return Response({'error': 'Invalid action. Choose from confirm, dismiss, initiate_claim.'}, status=status.HTTP_400_BAD_REQUEST)

        match_record.save()
        return Response({
            'message': f"Match status updated to {match_record.get_status_display()}.",
            'match': MatchRecordSerializer(match_record).data
        }, status=status.HTTP_200_OK)

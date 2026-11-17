from rest_framework import serializers
from .models import ClaimRequest
from accounts.serializers import UserSerializer
from items.serializers import FoundItemSerializer, LostItemSerializer

class ClaimRequestSerializer(serializers.ModelSerializer):
    claimant = UserSerializer(read_only=True)
    found_item = FoundItemSerializer(read_only=True)
    lost_item = LostItemSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClaimRequest
        fields = [
            'id', 'claimant', 'found_item', 'lost_item',
            'status', 'status_display',
            'unique_identifying_features', 'serial_number', 'proof_of_ownership',
            'reviewed_by', 'admin_notes', 'decision_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'claimant', 'reviewed_by', 'decision_date', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user:
            user = request.user
            # Only claimant, the finder of the item, or an admin can see private verification details
            is_authorized = (
                user == instance.claimant or
                user == instance.found_item.finder or
                user.is_staff or
                getattr(user, 'role', '') == 'admin'
            )
            if not is_authorized:
                data['unique_identifying_features'] = "PROTECTED / CONFIDENTIAL"
                data['serial_number'] = "PROTECTED"
                data['proof_of_ownership'] = None
        return data

class ClaimRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimRequest
        fields = [
            'id', 'status', 'found_item', 'lost_item',
            'unique_identifying_features', 'serial_number', 'proof_of_ownership',
            'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']

    def validate(self, attrs):
        user = self.context['request'].user
        found_item = attrs.get('found_item')
        if found_item.finder == user:
            raise serializers.ValidationError("You cannot submit an ownership claim on an item you reported found.")
        # Check if already submitted
        existing = ClaimRequest.objects.filter(claimant=user, found_item=found_item, status__in=['pending', 'under_review']).first()
        if existing:
            raise serializers.ValidationError("You already have an active claim pending review for this item.")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        claim = ClaimRequest.objects.create(claimant=user, **validated_data)
        return claim

class ClaimStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimRequest
        fields = ['status', 'admin_notes']

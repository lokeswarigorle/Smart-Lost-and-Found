from django.db import models
from django.conf import settings
from items.models import FoundItem, LostItem

class ClaimRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('resolved', 'Resolved & Handed Over'),
    ]

    claimant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='claims'
    )
    found_item = models.ForeignKey(
        FoundItem,
        on_delete=models.CASCADE,
        related_name='claims'
    )
    lost_item = models.ForeignKey(
        LostItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claims'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Private Verification Information (Encrypted / Protected from public views)
    unique_identifying_features = models.TextField(
        help_text="Detailed private description, internal contents, scratches, unique markings, wallpaper, etc."
    )
    serial_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Serial number, IMEI, or unique ID"
    )
    proof_of_ownership = models.ImageField(
        upload_to='claim_proofs/',
        blank=True,
        null=True,
        help_text="Receipt, previous photo, purchase invoice, or ID document"
    )

    # Verification Decision & Administrative Trail
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_claims'
    )
    admin_notes = models.TextField(blank=True, null=True)
    decision_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Claim #{self.id} on FoundItem #{self.found_item_id} by {self.claimant.username} ({self.status})"

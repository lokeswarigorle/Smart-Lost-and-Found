from django.db import models
from items.models import LostItem, FoundItem

class ItemEmbedding(models.Model):
    lost_item = models.OneToOneField(
        LostItem,
        on_delete=models.CASCADE,
        related_name='embedding_record',
        null=True,
        blank=True
    )
    found_item = models.OneToOneField(
        FoundItem,
        on_delete=models.CASCADE,
        related_name='embedding_record',
        null=True,
        blank=True
    )
    model_name = models.CharField(max_length=100, default='openai/clip-vit-base-patch32')
    embedding_dim = models.IntegerField(default=512)
    # Stored as JSON array of normalized floats
    embedding = models.JSONField(help_text="Normalized feature vector array")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        item_ref = f"LostItem #{self.lost_item_id}" if self.lost_item else f"FoundItem #{self.found_item_id}"
        return f"Embedding for {item_ref} ({self.embedding_dim}-dim)"

class MatchRecord(models.Model):
    CONFIDENCE_CHOICES = [
        ('high', 'High Similarity'),
        ('medium', 'Medium Similarity'),
        ('low', 'Low Similarity'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('confirmed_by_user', 'Confirmed by User'),
        ('rejected_by_user', 'Dismissed by User'),
        ('claim_initiated', 'Ownership Claim Initiated'),
    ]

    lost_item = models.ForeignKey(
        LostItem,
        on_delete=models.CASCADE,
        related_name='match_records'
    )
    found_item = models.ForeignKey(
        FoundItem,
        on_delete=models.CASCADE,
        related_name='match_records'
    )

    # Component Scores (0 to 100)
    image_similarity = models.FloatField(default=0.0)
    category_similarity = models.FloatField(default=0.0)
    color_similarity = models.FloatField(default=0.0)
    description_similarity = models.FloatField(default=0.0)
    location_similarity = models.FloatField(default=0.0)
    combined_score = models.FloatField(default=0.0)

    confidence_level = models.CharField(max_length=20, choices=CONFIDENCE_CHOICES, default='medium')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('lost_item', 'found_item')
        ordering = ['-combined_score', '-created_at']

    def __str__(self):
        return f"Match: Lost #{self.lost_item_id} <-> Found #{self.found_item_id} ({self.combined_score:.1f}%)"

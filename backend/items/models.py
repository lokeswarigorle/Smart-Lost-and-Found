from django.db import models
from django.conf import settings

CATEGORY_CHOICES = [
    ('electronics', 'Electronics & Gadgets'),
    ('phones', 'Mobile Phones'),
    ('laptops', 'Laptops & Tablets'),
    ('documents', 'Documents & ID Cards'),
    ('wallets', 'Wallets & Purses'),
    ('keys', 'Keys & Keychain'),
    ('bags', 'Bags & Luggage'),
    ('jewelry', 'Jewelry & Watches'),
    ('clothing', 'Clothing & Accessories'),
    ('pets', 'Pets & Animals'),
    ('other', 'Other Miscellaneous'),
]

CONTACT_CHOICES = [
    ('email', 'Email Only'),
    ('phone', 'Phone Number'),
    ('in_app', 'In-App Secure Messaging'),
    ('any', 'Any Contact Method'),
]

class LostItem(models.Model):
    STATUS_CHOICES = [
        ('reported', 'Reported / Searching'),
        ('matched', 'Potential Match Found'),
        ('claim_pending', 'Ownership Claim Pending'),
        ('recovered', 'Recovered & Closed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lost_items'
    )
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    primary_color = models.CharField(max_length=50)
    secondary_color = models.CharField(max_length=50, blank=True, null=True)
    date_lost = models.DateField()

    # Location Information
    location_name = models.CharField(max_length=255, help_text="Specific place, e.g. Central Library 2nd floor")
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Photograph & Contact
    image = models.ImageField(upload_to='lost_items/')
    contact_preference = models.CharField(max_length=20, choices=CONTACT_CHOICES, default='in_app')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='reported')
    is_resolved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[LOST] {self.title} - {self.city} ({self.status})"

class FoundItem(models.Model):
    STATUS_CHOICES = [
        ('available', 'Found / In Custody'),
        ('claimed', 'Claim Under Verification'),
        ('handed_over', 'Returned to Owner'),
        ('closed', 'Closed'),
    ]

    finder = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='found_items'
    )
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    primary_color = models.CharField(max_length=50)
    secondary_color = models.CharField(max_length=50, blank=True, null=True)
    date_found = models.DateField()

    # Location Information
    found_location = models.CharField(max_length=255, help_text="Specific place where item was found")
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Custody / Storage
    storage_location = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Safe keeping location (e.g. Campus Security, Finder Custody, Police Station)"
    )

    # Photograph & Contact
    image = models.ImageField(upload_to='found_items/')
    contact_preference = models.CharField(max_length=20, choices=CONTACT_CHOICES, default='in_app')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='available')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[FOUND] {self.title} - {self.city} ({self.status})"

class ItemImage(models.Model):
    lost_item = models.ForeignKey(
        LostItem,
        on_delete=models.CASCADE,
        related_name='additional_images',
        null=True,
        blank=True
    )
    found_item = models.ForeignKey(
        FoundItem,
        on_delete=models.CASCADE,
        related_name='additional_images',
        null=True,
        blank=True
    )
    image = models.ImageField(upload_to='item_gallery/')
    caption = models.CharField(max_length=150, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {'Lost Item #' + str(self.lost_item_id) if self.lost_item else 'Found Item #' + str(self.found_item_id)}"

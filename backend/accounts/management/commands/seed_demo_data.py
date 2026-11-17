import os
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
from PIL import Image, ImageDraw
import io
from items.models import LostItem, FoundItem
from matching.services import run_match_for_lost_item, run_match_for_found_item

User = get_user_model()

def make_test_image(color_rgb, text="ITEM"):
    img = Image.new("RGB", (400, 300), color=color_rgb)
    draw = ImageDraw.Draw(img)
    # Draw simple shapes to give visual features
    draw.rectangle([50, 50, 350, 250], outline=(255, 255, 255), width=4)
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return ContentFile(buffer.getvalue(), name=f"{text.lower().replace(' ', '_')}.jpg")

class Command(BaseCommand):
    help = "Seeds demo users, sample lost and found reports, and generates AI matches."

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")

        # 1. Admin
        admin_user, created = User.objects.get_or_create(username="admin", defaults={
            'email': 'admin@smartlostfound.local',
            'role': User.ROLE_ADMIN,
            'is_staff': True,
            'is_superuser': True,
            'city': 'Hyderabad'
        })
        if created:
            admin_user.set_password("Admin@123")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user (admin / Admin@123)"))

        # 2. General User (Alice)
        alice, created = User.objects.get_or_create(username="alice", defaults={
            'email': 'alice@smartlostfound.local',
            'role': User.ROLE_USER,
            'phone_number': '+91 9876543210',
            'city': 'Hyderabad'
        })
        if created:
            alice.set_password("Alice@123")
            alice.save()
            self.stdout.write(self.style.SUCCESS("Created user alice (alice / Alice@123)"))

        # 3. Finder User (Bob)
        bob, created = User.objects.get_or_create(username="bob", defaults={
            'email': 'bob@smartlostfound.local',
            'role': User.ROLE_FINDER,
            'phone_number': '+91 9123456780',
            'city': 'Hyderabad'
        })
        if created:
            bob.set_password("Bob@123")
            bob.save()
            self.stdout.write(self.style.SUCCESS("Created finder bob (bob / Bob@123)"))

        # 4. Lost Item 1 - Apple MacBook Pro
        lost_mac, created = LostItem.objects.get_or_create(
            title="Space Grey MacBook Pro 14-inch",
            user=alice,
            defaults={
                'category': 'laptops',
                'description': 'Apple MacBook Pro M2 with a GitHub Octocat sticker on top shell.',
                'primary_color': 'Grey',
                'secondary_color': 'Black',
                'date_lost': date.today() - timedelta(days=2),
                'location_name': 'Hitech City Metro Station, Concourse Level',
                'city': 'Hyderabad',
                'area': 'Madhapur',
                'latitude': 17.4435,
                'longitude': 78.3772,
                'contact_preference': 'in_app',
                'status': 'reported'
            }
        )
        if created:
            lost_mac.image.save('lost_macbook.jpg', make_test_image((70, 75, 80), "MacBook"))
            lost_mac.save()
            self.stdout.write(self.style.SUCCESS("Created Lost Item: MacBook Pro"))

        # 5. Found Item 1 - Apple MacBook Pro
        found_mac, created = FoundItem.objects.get_or_create(
            title="Found Apple Laptop in Metro",
            finder=bob,
            defaults={
                'category': 'laptops',
                'description': 'Found space grey MacBook laptop left on a bench near ticket counter.',
                'primary_color': 'Grey',
                'secondary_color': 'Black',
                'date_found': date.today() - timedelta(days=2),
                'found_location': 'Hitech City Metro Station Waiting Area',
                'city': 'Hyderabad',
                'area': 'Madhapur',
                'latitude': 17.4440,
                'longitude': 78.3778,
                'storage_location': 'Station Master Security Office',
                'contact_preference': 'in_app',
                'status': 'available'
            }
        )
        if created:
            found_mac.image.save('found_macbook.jpg', make_test_image((65, 72, 78), "FoundMac"))
            found_mac.save()
            self.stdout.write(self.style.SUCCESS("Created Found Item: MacBook Laptop"))

        # 6. Lost Item 2 - Brown Leather Wallet
        lost_wallet, created = LostItem.objects.get_or_create(
            title="Brown Leather Bifold Wallet",
            user=alice,
            defaults={
                'category': 'wallets',
                'description': 'Dark brown leather wallet with cards and driver license.',
                'primary_color': 'Brown',
                'secondary_color': 'Tan',
                'date_lost': date.today() - timedelta(days=5),
                'location_name': 'KBR National Park Jogging Track',
                'city': 'Hyderabad',
                'area': 'Jubilee Hills',
                'latitude': 17.4241,
                'longitude': 78.4239,
                'contact_preference': 'in_app',
                'status': 'reported'
            }
        )
        if created:
            lost_wallet.image.save('lost_wallet.jpg', make_test_image((139, 69, 19), "Wallet"))
            lost_wallet.save()
            self.stdout.write(self.style.SUCCESS("Created Lost Item: Brown Leather Wallet"))

        # 7. Found Item 2 - Brown Leather Wallet
        found_wallet, created = FoundItem.objects.get_or_create(
            title="Found Leather Wallet near KBR Park",
            finder=bob,
            defaults={
                'category': 'wallets',
                'description': 'Found brown bifold wallet on a park bench in the evening.',
                'primary_color': 'Brown',
                'secondary_color': 'Tan',
                'date_found': date.today() - timedelta(days=5),
                'found_location': 'KBR Park Gate 2 Bench',
                'city': 'Hyderabad',
                'area': 'Jubilee Hills',
                'latitude': 17.4250,
                'longitude': 78.4245,
                'storage_location': 'With finder Bob',
                'contact_preference': 'in_app',
                'status': 'available'
            }
        )
        if created:
            found_wallet.image.save('found_wallet.jpg', make_test_image((145, 72, 22), "FoundWallet"))
            found_wallet.save()
            self.stdout.write(self.style.SUCCESS("Created Found Item: Brown Leather Wallet"))

        # 8. Run matching engine
        self.stdout.write("Calculating AI similarity matches...")
        run_match_for_lost_item(lost_mac)
        run_match_for_lost_item(lost_wallet)

        self.stdout.write(self.style.SUCCESS("Demo data seeded and AI matches calculated successfully!"))

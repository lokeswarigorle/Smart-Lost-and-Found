from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from items.models import FoundItem
from claims.models import ClaimRequest
from datetime import date
from PIL import Image
import io
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class ClaimsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.finder = User.objects.create_user(username='finder1', password='Password@123', role='finder')
        self.claimant = User.objects.create_user(username='claimant1', password='Password@123', role='user')
        self.stranger = User.objects.create_user(username='stranger1', password='Password@123', role='user')

        img = Image.new('RGB', (50, 50), color=(100, 100, 100))
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        uploaded_img = SimpleUploadedFile('found.jpg', buf.getvalue(), content_type='image/jpeg')

        self.found_item = FoundItem.objects.create(
            finder=self.finder,
            title='Found Watch',
            category='jewelry',
            description='Silver wristwatch found at gym',
            primary_color='Silver',
            date_found=date.today(),
            found_location='City Gym Locker Room',
            city='Hyderabad',
            image=uploaded_img
        )

    def test_submit_claim(self):
        self.client.force_authenticate(user=self.claimant)
        url = reverse('claims_list_create')
        data = {
            'found_item': self.found_item.id,
            'unique_identifying_features': 'Engraved with initials AB on the back cover',
            'serial_number': 'SN-987654',
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'pending')
        claim_id = res.data['id']

        # Verify stranger cannot access other users' claims
        self.client.force_authenticate(user=self.stranger)
        detail_url = reverse('claims_detail', args=[claim_id])
        res_stranger = self.client.get(detail_url)
        self.assertEqual(res_stranger.status_code, status.HTTP_404_NOT_FOUND)

        # Verify claimant can access their own claim
        self.client.force_authenticate(user=self.claimant)
        res_claimant = self.client.get(detail_url)
        self.assertEqual(res_claimant.status_code, status.HTTP_200_OK)
        self.assertEqual(res_claimant.data['unique_identifying_features'], 'Engraved with initials AB on the back cover')

        # Verify finder can access the claim to verify
        self.client.force_authenticate(user=self.finder)
        res_finder = self.client.get(detail_url)
        self.assertEqual(res_finder.status_code, status.HTTP_200_OK)

    def test_finder_can_approve_claim(self):
        claim = ClaimRequest.objects.create(
            claimant=self.claimant,
            found_item=self.found_item,
            unique_identifying_features='Secret engraving',
            status='pending'
        )
        self.client.force_authenticate(user=self.finder)
        status_url = reverse('claims_status_update', args=[claim.id])
        res = self.client.patch(status_url, {
            'status': 'approved',
            'admin_notes': 'Verified at gym front desk.'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        claim.refresh_from_db()
        self.assertEqual(claim.status, 'approved')
        self.found_item.refresh_from_db()
        self.assertEqual(self.found_item.status, 'handed_over')

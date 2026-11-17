from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from items.models import LostItem, FoundItem
from datetime import date
from PIL import Image
import io
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class ItemsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='itemuser',
            password='Password@123',
            role='user'
        )
        self.client.force_authenticate(user=self.user)

    def _get_test_image(self):
        img = Image.new('RGB', (100, 100), color=(100, 150, 200))
        buf = io.BytesIO()
        img.save(buf, format='JPEG')
        return SimpleUploadedFile('test.jpg', buf.getvalue(), content_type='image/jpeg')

    def test_create_and_list_lost_item(self):
        url = reverse('lost_items_list_create')
        data = {
            'title': 'Lost Keys',
            'category': 'keys',
            'description': 'Set of 3 keys with blue keychain',
            'primary_color': 'Blue',
            'date_lost': str(date.today()),
            'location_name': 'Central Bus Station',
            'city': 'Hyderabad',
            'latitude': 17.3850,
            'longitude': 78.4867,
            'image': self._get_test_image()
        }
        res = self.client.post(url, data, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'Lost Keys')

        # List lost items
        res_list = self.client.get(url)
        self.assertEqual(res_list.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res_list.data['results']) >= 1)

    def test_nearby_items_api(self):
        # Create a found item
        FoundItem.objects.create(
            finder=self.user,
            title='Found Keys near Bus Stand',
            category='keys',
            description='Keys with blue ring found on bench',
            primary_color='Blue',
            date_found=date.today(),
            found_location='Bus Stand Platform 4',
            city='Hyderabad',
            latitude=17.3855,
            longitude=78.4870,
            image=self._get_test_image()
        )
        url = reverse('nearby_items')
        res = self.client.get(url, {'lat': 17.3850, 'lon': 78.4867, 'radius': 10})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['count'] >= 1)

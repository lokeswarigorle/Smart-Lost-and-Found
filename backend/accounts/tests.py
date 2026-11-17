from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='Password@123',
            role='user'
        )

    def test_user_registration(self):
        url = reverse('auth_register')
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'StrongPassword@123',
            'password_confirm': 'StrongPassword@123',
            'role': 'user',
            'city': 'Hyderabad'
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_user_login(self):
        url = reverse('auth_login')
        data = {
            'username': 'testuser',
            'password': 'Password@123'
        }
        res = self.client.post(url, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertEqual(res.data['user']['username'], 'testuser')

    def test_profile_access(self):
        url = reverse('auth_profile')
        # Unauthenticated
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        # Authenticated
        self.client.force_authenticate(user=self.user)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'testuser')

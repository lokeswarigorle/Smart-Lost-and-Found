from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.regular_user = User.objects.create_user(username='regular', password='Password@123', role='user')
        self.admin_user = User.objects.create_user(username='superadmin', password='Password@123', role='admin', is_staff=True)

    def test_user_dashboard(self):
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('dashboard_user_stats')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('my_lost_items', res.data)
        self.assertIn('my_found_items', res.data)
        self.assertIn('unread_notifications', res.data)

    def test_admin_dashboard_permissions(self):
        url = reverse('dashboard_admin_stats')
        # Regular user should be forbidden
        self.client.force_authenticate(user=self.regular_user)
        res_reg = self.client.get(url)
        self.assertEqual(res_reg.status_code, status.HTTP_403_FORBIDDEN)

        # Admin user should succeed
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get(url)
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertIn('overview', res_admin.data)
        self.assertIn('total_users', res_admin.data['overview'])
        self.assertIn('total_lost_items', res_admin.data['overview'])
        self.assertIn('total_found_items', res_admin.data['overview'])
        self.assertIn('total_possible_matches', res_admin.data['overview'])

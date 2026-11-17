from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from notifications.models import Notification
from notifications.services import create_notification

User = get_user_model()

class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='notifuser', password='Password@123', email='test@test.local')
        self.client.force_authenticate(user=self.user)

    def test_notification_flow(self):
        create_notification(
            recipient=self.user,
            notification_type='match_found',
            title='Potential Match',
            message='Your lost item has a potential match.',
            link='/matches',
            send_email=False
        )

        url = reverse('notifications_list')
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['unread_count'], 1)
        self.assertEqual(len(res.data['results']), 1)

        # Mark as read
        notif_id = res.data['results'][0]['id']
        read_url = reverse('notification_mark_read', args=[notif_id])
        res_read = self.client.patch(read_url)
        self.assertEqual(res_read.status_code, status.HTTP_200_OK)

        res_after = self.client.get(url)
        self.assertEqual(res_after.data['unread_count'], 0)

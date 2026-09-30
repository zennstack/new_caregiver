from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from devices.models import Device
from alerts.models import Alert

User = get_user_model()

class AlertAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='cg1', password='password123', role='CAREGIVER')
        self.client.force_authenticate(user=self.user)
        self.device = Device.objects.create(device_id='DEV-ALT-1', name='Alert Cane', owner=self.user)

    def test_alert_creation_and_resolution(self):
        payload = {
            'device': self.device.id,
            'alert_type': 'SOS',
            'message': 'SOS pressed',
            'latitude': 8.4542,
            'longitude': 124.6319
        }
        post_resp = self.client.post('/api/alerts/', payload, format='json')
        self.assertEqual(post_resp.status_code, status.HTTP_201_CREATED)
        alert_id = post_resp.data['id']
        self.assertFalse(post_resp.data['is_resolved'])

        # Mark resolved via PATCH
        patch_resp = self.client.patch(f'/api/alerts/{alert_id}/', {'is_resolved': True}, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(patch_resp.data['is_resolved'])

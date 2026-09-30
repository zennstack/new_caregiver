from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from devices.models import Device
from locations.models import Location

User = get_user_model()

class LocationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='cg1', password='password123', role='CAREGIVER')
        self.client.force_authenticate(user=self.user)
        self.device = Device.objects.create(device_id='DEV-GPS-1', name='GPS Cane', owner=self.user)

    def test_location_creation_and_list(self):
        payload = {
            'device': self.device.id,
            'latitude': 8.4542,
            'longitude': 124.6319
        }
        post_response = self.client.post('/api/locations/', payload, format='json')
        self.assertEqual(post_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Location.objects.count(), 1)

        get_response = self.client.get('/api/locations/')
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(get_response.data), 1)

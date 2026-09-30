from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from devices.models import Device
from accounts.models import CaregiverPatient

User = get_user_model()

class DeviceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.caregiver = User.objects.create_user(
            username='cg1', email='cg@example.com', password='password123', role='CAREGIVER'
        )
        self.sg_user = User.objects.create_user(
            username='user1', email='user@example.com', password='password123', role='PATIENT'
        )
        # Create pairing between caregiver and patient
        CaregiverPatient.objects.create(caregiver=self.caregiver, patient=self.sg_user, status='ACTIVE')
        self.client.force_authenticate(user=self.caregiver)

    def test_device_creation_and_authorization(self):
        payload = {
            'device_id': 'DEV-TEST-100',
            'name': 'Test Smart Cane',
            'owner': self.sg_user.id
        }
        response = self.client.post('/api/devices/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Device.objects.count(), 1)
        self.assertEqual(Device.objects.get().device_id, 'DEV-TEST-100')

    def test_device_list_authorization(self):
        Device.objects.create(device_id='DEV-1', name='Cane 1', owner=self.sg_user)
        
        # Paired Caregiver can see device
        response = self.client.get('/api/devices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # SmartGuide Patient can see their own device
        self.client.force_authenticate(user=self.sg_user)
        user_response = self.client.get('/api/devices/')
        self.assertEqual(user_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(user_response.data), 1)

    def test_unpaired_caregiver_cannot_see_device(self):
        Device.objects.create(device_id='DEV-1', name='Cane 1', owner=self.sg_user)
        other_caregiver = User.objects.create_user(
            username='cg2', email='cg2@example.com', password='password123', role='CAREGIVER'
        )
        self.client.force_authenticate(user=other_caregiver)
        response = self.client.get('/api/devices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

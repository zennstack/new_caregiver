from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import CaregiverPatient

User = get_user_model()

class CaregiverPatientPairingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.me_url = reverse('auth_me')
        self.pairings_url = '/api/pairings/'
        self.my_patients_url = '/api/patients/my/'
        self.my_pairings_url = '/api/pairings/my/'

        # Setup test users
        self.caregiver1 = User.objects.create_user(
            username='caregiver1', email='cg1@example.com', password='password123',
            role=User.ROLE_CAREGIVER, first_name='Jane', last_name='Doe'
        )
        self.caregiver2 = User.objects.create_user(
            username='caregiver2', email='cg2@example.com', password='password123',
            role=User.ROLE_CAREGIVER, first_name='Mary', last_name='Smith'
        )
        self.patient1 = User.objects.create_user(
            username='patient1', email='pt1@example.com', password='password123',
            role=User.ROLE_PATIENT, first_name='Juan', last_name='Patient'
        )
        self.patient2 = User.objects.create_user(
            username='patient2', email='pt2@example.com', password='password123',
            role=User.ROLE_PATIENT, first_name='Bob', last_name='Patient'
        )

    def test_01_existing_caregiver_login_still_works(self):
        login_data = {'username': 'caregiver1', 'password': 'password123'}
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'CAREGIVER')

    def test_02_existing_auth_me_endpoint_works(self):
        self.client.force_authenticate(user=self.caregiver1)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'caregiver1')
        self.assertEqual(response.data['role'], 'CAREGIVER')

    def test_03_register_new_caregiver(self):
        payload = {
            'username': 'new_caregiver',
            'email': 'new_cg@example.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'first_name': 'New',
            'last_name': 'Caregiver',
            'role': 'CAREGIVER'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='new_caregiver').role, User.ROLE_CAREGIVER)

    def test_04_register_new_patient(self):
        payload = {
            'username': 'new_patient',
            'email': 'new_pt@example.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'first_name': 'New',
            'last_name': 'Patient',
            'role': 'PATIENT'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='new_patient').role, User.ROLE_PATIENT)

    def test_05_login_as_caregiver(self):
        login_data = {'username': 'caregiver1', 'password': 'password123'}
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_06_pair_caregiver_with_patient(self):
        self.client.force_authenticate(user=self.caregiver1)
        payload = {'patient_username': 'patient1'}
        response = self.client.post(self.pairings_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(CaregiverPatient.objects.filter(caregiver=self.caregiver1, patient=self.patient1).exists())

    def test_07_caregiver_can_see_paired_patient(self):
        CaregiverPatient.objects.create(caregiver=self.caregiver1, patient=self.patient1, status='ACTIVE')
        self.client.force_authenticate(user=self.caregiver1)
        response = self.client.get(self.my_patients_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        usernames = [p['username'] for p in response.data]
        self.assertIn('patient1', usernames)
        self.assertNotIn('patient2', usernames)

    def test_08_caregiver_cannot_see_unrelated_patient(self):
        CaregiverPatient.objects.create(caregiver=self.caregiver1, patient=self.patient1, status='ACTIVE')
        self.client.force_authenticate(user=self.caregiver1)
        response = self.client.get(self.my_patients_url)
        usernames = [p['username'] for p in response.data]
        self.assertNotIn('patient2', usernames)

    def test_09_login_as_patient(self):
        login_data = {'username': 'patient1', 'password': 'password123'}
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['role'], 'PATIENT')

    def test_10_patient_can_see_own_pairing_information(self):
        CaregiverPatient.objects.create(caregiver=self.caregiver1, patient=self.patient1, status='ACTIVE')
        self.client.force_authenticate(user=self.patient1)
        response = self.client.get(self.my_pairings_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['caregiver_detail']['username'], 'caregiver1')

    def test_11_patient_cannot_access_another_patients_information(self):
        CaregiverPatient.objects.create(caregiver=self.caregiver1, patient=self.patient1, status='ACTIVE')
        self.client.force_authenticate(user=self.patient2)
        response = self.client.get(self.my_pairings_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_12_duplicate_pairing_rejected(self):
        CaregiverPatient.objects.create(caregiver=self.caregiver1, patient=self.patient1, status='ACTIVE')
        self.client.force_authenticate(user=self.caregiver1)
        payload = {'patient_username': 'patient1'}
        response = self.client.post(self.pairings_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_13_caregiver_cannot_pair_with_another_caregiver(self):
        self.client.force_authenticate(user=self.caregiver1)
        payload = {'patient_username': 'caregiver2'}
        response = self.client.post(self.pairings_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_14_patient_cannot_create_pairing_pretending_to_be_caregiver(self):
        self.client.force_authenticate(user=self.patient1)
        payload = {'patient_username': 'patient2'}
        response = self.client.post(self.pairings_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import CaregiverPatient
from devices.models import Device
from locations.models import Location
from alerts.models import Alert

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial development test data (Caregivers, Patients, Pairings, Devices, Locations, Alerts)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding SmartGuide development test data...'))

        # 1. Caregivers
        caregiver1, created = User.objects.get_or_create(
            username='caregiver1',
            defaults={
                'email': 'caregiver@example.com',
                'first_name': 'Jane',
                'last_name': 'Doe',
                'role': User.ROLE_CAREGIVER,
                'is_staff': True,
            }
        )
        if created:
            caregiver1.set_password('password123')
            caregiver1.save()
            self.stdout.write(self.style.SUCCESS('Created Caregiver: caregiver1 (password: password123)'))
        else:
            caregiver1.role = User.ROLE_CAREGIVER
            caregiver1.save()

        caregiver2, created = User.objects.get_or_create(
            username='caregiver2',
            defaults={
                'email': 'caregiver2@example.com',
                'first_name': 'Other',
                'last_name': 'Caregiver',
                'role': User.ROLE_CAREGIVER,
            }
        )
        if created:
            caregiver2.set_password('password123')
            caregiver2.save()
            self.stdout.write(self.style.SUCCESS('Created Unpaired Caregiver: caregiver2 (password: password123)'))

        # 2. Patients
        patient1, created = User.objects.get_or_create(
            username='patient1',
            defaults={
                'email': 'patient@example.com',
                'first_name': 'Juan',
                'last_name': 'Patient',
                'role': User.ROLE_PATIENT,
            }
        )
        if created:
            patient1.set_password('password123')
            patient1.save()
            self.stdout.write(self.style.SUCCESS('Created Patient: patient1 (password: password123)'))
        else:
            patient1.role = User.ROLE_PATIENT
            patient1.save()

        patient2, created = User.objects.get_or_create(
            username='patient2',
            defaults={
                'email': 'patient2@example.com',
                'first_name': 'Unpaired',
                'last_name': 'Patient',
                'role': User.ROLE_PATIENT,
            }
        )
        if created:
            patient2.set_password('password123')
            patient2.save()
            self.stdout.write(self.style.SUCCESS('Created Unpaired Patient: patient2 (password: password123)'))

        # Handle migration of legacy user1 account if present
        user1 = User.objects.filter(username='user1').first()
        if user1 and user1.role != User.ROLE_PATIENT:
            user1.role = User.ROLE_PATIENT
            user1.save()

        # 3. Pairings
        pairing, created = CaregiverPatient.objects.get_or_create(
            caregiver=caregiver1,
            patient=patient1,
            defaults={'status': CaregiverPatient.STATUS_ACTIVE}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Pairing: caregiver1 <-> patient1 (ACTIVE)'))

        # 4. Devices
        device1, created = Device.objects.get_or_create(
            device_id='SG-CANE-001',
            defaults={
                'name': "Juan's Smart Cane",
                'owner': patient1,
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Device: SG-CANE-001 (owned by patient1)'))

        device2, created = Device.objects.get_or_create(
            device_id='SG-CANE-002',
            defaults={
                'name': "Unpaired Patient Cane",
                'owner': patient2,
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Device: SG-CANE-002 (owned by patient2)'))

        # 5. Locations
        if Location.objects.filter(device=device1).count() == 0:
            Location.objects.create(device=device1, latitude=8.4542, longitude=124.6319)
            Location.objects.create(device=device1, latitude=8.4550, longitude=124.6325)
            Location.objects.create(device=device1, latitude=8.4561, longitude=124.6340)

        if Location.objects.filter(device=device2).count() == 0:
            Location.objects.create(device=device2, latitude=14.5995, longitude=120.9842)

        # 6. Alerts
        if Alert.objects.filter(device=device1).count() == 0:
            Alert.objects.create(
                device=device1, alert_type=Alert.TYPE_SOS,
                message='Emergency SOS button pressed by patient!', latitude=8.4561, longitude=124.6340, is_resolved=False
            )
            Alert.objects.create(
                device=device1, alert_type=Alert.TYPE_FALL,
                message='Fall detected near sidewalk obstacle', latitude=8.4550, longitude=124.6325, is_resolved=False
            )

        if Alert.objects.filter(device=device2).count() == 0:
            Alert.objects.create(
                device=device2, alert_type=Alert.TYPE_SOS,
                message='Unpaired patient emergency SOS!', latitude=14.5995, longitude=120.9842, is_resolved=False
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded SmartGuide test data!'))

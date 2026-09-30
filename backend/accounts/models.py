from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.exceptions import ValidationError

class User(AbstractUser):
    ROLE_CAREGIVER = 'CAREGIVER'
    ROLE_PATIENT = 'PATIENT'
    ROLE_USER = 'USER'  # Kept for backwards compatibility

    ROLE_CHOICES = [
        (ROLE_CAREGIVER, 'Caregiver'),
        (ROLE_PATIENT, 'Patient'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_CAREGIVER,
        help_text='User role in SmartGuide (Caregiver or Patient)'
    )

    def is_caregiver(self):
        return self.role == self.ROLE_CAREGIVER

    def is_patient(self):
        return self.role in (self.ROLE_PATIENT, self.ROLE_USER)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class CaregiverPatient(models.Model):
    STATUS_PENDING = 'PENDING'
    STATUS_ACTIVE = 'ACTIVE'
    STATUS_REJECTED = 'REJECTED'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACTIVE, 'Active'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    caregiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='caregiver_pairings',
        help_text="Caregiver account"
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_pairings',
        help_text="Patient account"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('caregiver', 'patient')
        ordering = ['-created_at']

    def clean(self):
        if self.caregiver == self.patient:
            raise ValidationError("Caregiver and patient cannot be the same user.")
        if self.caregiver.role != User.ROLE_CAREGIVER:
            raise ValidationError("Assigned caregiver user must have the CAREGIVER role.")
        if self.patient.role not in (User.ROLE_PATIENT, User.ROLE_USER):
            raise ValidationError("Assigned patient user must have the PATIENT role.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Caregiver {self.caregiver.username} -> Patient {self.patient.username} ({self.status})"

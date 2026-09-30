from django.db import models
from devices.models import Device

class Alert(models.Model):
    TYPE_SOS = 'SOS'
    TYPE_FALL = 'FALL'
    TYPE_LOW_BATTERY = 'LOW_BATTERY'
    TYPE_OTHER = 'OTHER'

    ALERT_TYPE_CHOICES = [
        (TYPE_SOS, 'Emergency SOS'),
        (TYPE_FALL, 'Fall Detected'),
        (TYPE_LOW_BATTERY, 'Low Battery'),
        (TYPE_OTHER, 'Other Alert'),
    ]

    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        related_name='alerts',
        help_text="SmartGuide device triggering the alert"
    )
    alert_type = models.CharField(
        max_length=20,
        choices=ALERT_TYPE_CHOICES,
        default=TYPE_OTHER
    )
    message = models.TextField(help_text="Descriptive alert notification message")
    latitude = models.FloatField(null=True, blank=True, help_text="Latitude at time of alert")
    longitude = models.FloatField(null=True, blank=True, help_text="Longitude at time of alert")
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"[{self.alert_type}] Device {self.device.device_id} - {'Resolved' if self.is_resolved else 'Active'}"

    class Meta:
        ordering = ['-created_at']

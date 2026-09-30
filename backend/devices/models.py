from django.db import models
from django.conf import settings

class Device(models.Model):
    device_id = models.CharField(max_length=100, unique=True, help_text="Unique hardware/device identifier, e.g., SG-CANE-001")
    name = models.CharField(max_length=150, help_text="Human-readable name for the device")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='devices',
        help_text="User (or visually impaired cane user) associated with this device"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.device_id})"

    class Meta:
        ordering = ['-created_at']

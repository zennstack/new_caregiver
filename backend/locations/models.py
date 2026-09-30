from django.db import models
from devices.models import Device

class Location(models.Model):
    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        related_name='locations',
        help_text="Device associated with this location update"
    )
    latitude = models.FloatField(help_text="Latitude coordinate (e.g. 8.4542)")
    longitude = models.FloatField(help_text="Longitude coordinate (e.g. 124.6319)")
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Device {self.device.device_id} at ({self.latitude}, {self.longitude}) on {self.timestamp}"

    class Meta:
        ordering = ['-timestamp']

from rest_framework import serializers
from .models import Alert
from devices.serializers import DeviceSerializer

class AlertSerializer(serializers.ModelSerializer):
    device_detail = DeviceSerializer(source='device', read_only=True)

    class Meta:
        model = Alert
        fields = ('id', 'device', 'device_detail', 'alert_type', 'message', 'latitude', 'longitude', 'created_at', 'is_resolved')
        read_only_fields = ('id', 'created_at')

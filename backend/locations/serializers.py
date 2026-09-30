from rest_framework import serializers
from .models import Location
from devices.serializers import DeviceSerializer

class LocationSerializer(serializers.ModelSerializer):
    device_detail = DeviceSerializer(source='device', read_only=True)

    class Meta:
        model = Location
        fields = ('id', 'device', 'device_detail', 'latitude', 'longitude', 'timestamp')
        read_only_fields = ('id', 'timestamp')

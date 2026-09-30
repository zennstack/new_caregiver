from rest_framework import serializers
from .models import Device
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class DeviceSerializer(serializers.ModelSerializer):
    owner_detail = UserSerializer(source='owner', read_only=True)
    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )

    class Meta:
        model = Device
        fields = ('id', 'device_id', 'name', 'owner', 'owner_detail', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        # If owner not specified, default to request user
        if 'owner' not in validated_data:
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                validated_data['owner'] = request.user
        return super().create(validated_data)

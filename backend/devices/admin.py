from django.contrib import admin
from .models import Device

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('device_id', 'name', 'owner', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('device_id', 'name', 'owner__username')

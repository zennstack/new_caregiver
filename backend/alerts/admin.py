from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'alert_type', 'is_resolved', 'created_at')
    list_filter = ('alert_type', 'is_resolved', 'created_at')
    search_fields = ('message', 'device__device_id')
    ordering = ('-created_at',)

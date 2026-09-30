from django.contrib import admin
from .models import Location

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('id', 'device', 'latitude', 'longitude', 'timestamp')
    list_filter = ('device', 'timestamp')
    ordering = ('-timestamp',)

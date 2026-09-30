from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CaregiverPatient

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('SmartGuide Role', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('SmartGuide Role', {'fields': ('role',)}),
    )

@admin.register(CaregiverPatient)
class CaregiverPatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'caregiver', 'patient', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('caregiver__username', 'patient__username')
    ordering = ('-created_at',)

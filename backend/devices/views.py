from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Device
from .serializers import DeviceSerializer
from accounts.models import CaregiverPatient, User

class IsCaregiverOrDeviceOwner(permissions.BasePermission):
    """
    Custom permission: Caregivers can manage devices belonging to patients paired with them;
    Patients can view or manage their own devices.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        if request.user.role == User.ROLE_CAREGIVER:
            if obj.owner == request.user:
                return True
            return CaregiverPatient.objects.filter(
                caregiver=request.user,
                patient=obj.owner,
                status=CaregiverPatient.STATUS_ACTIVE
            ).exists()
        return obj.owner == request.user

class DeviceViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated, IsCaregiverOrDeviceOwner]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Device.objects.all()
        if user.role == User.ROLE_CAREGIVER:
            paired_patient_ids = CaregiverPatient.objects.filter(
                caregiver=user,
                status=CaregiverPatient.STATUS_ACTIVE
            ).values_list('patient_id', flat=True)
            return Device.objects.filter(Q(owner=user) | Q(owner_id__in=paired_patient_ids))
        return Device.objects.filter(owner=user)

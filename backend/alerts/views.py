from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Alert
from .serializers import AlertSerializer
from accounts.models import CaregiverPatient, User

class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = Alert.objects.all()
        elif user.role == User.ROLE_CAREGIVER:
            paired_patient_ids = CaregiverPatient.objects.filter(
                caregiver=user,
                status=CaregiverPatient.STATUS_ACTIVE
            ).values_list('patient_id', flat=True)
            queryset = Alert.objects.filter(
                Q(device__owner=user) | Q(device__owner_id__in=paired_patient_ids)
            )
        else:
            queryset = Alert.objects.filter(device__owner=user)

        device_id = self.request.query_params.get('device', None)
        alert_type = self.request.query_params.get('alert_type', None)
        is_resolved = self.request.query_params.get('is_resolved', None)

        if device_id is not None:
            queryset = queryset.filter(device_id=device_id)
        if alert_type is not None:
            queryset = queryset.filter(alert_type=alert_type)
        if is_resolved is not None:
            resolved_bool = is_resolved.lower() in ['true', '1', 't']
            queryset = queryset.filter(is_resolved=resolved_bool)

        return queryset

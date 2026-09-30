from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Location
from .serializers import LocationSerializer
from accounts.models import CaregiverPatient, User

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            queryset = Location.objects.all()
        elif user.role == User.ROLE_CAREGIVER:
            paired_patient_ids = CaregiverPatient.objects.filter(
                caregiver=user,
                status=CaregiverPatient.STATUS_ACTIVE
            ).values_list('patient_id', flat=True)
            queryset = Location.objects.filter(
                Q(device__owner=user) | Q(device__owner_id__in=paired_patient_ids)
            )
        else:
            queryset = Location.objects.filter(device__owner=user)

        device_id = self.request.query_params.get('device', None)
        if device_id is not None:
            queryset = queryset.filter(device_id=device_id)

        return queryset

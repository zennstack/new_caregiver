from django.contrib import admin
from django.urls import path, include
from accounts.views import CaregiverPatientViewSet, MyPatientsView, MyPairingsView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'pairings', CaregiverPatientViewSet, basename='api_pairing')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/pairings/my/', MyPairingsView.as_view(), name='root_my_pairings'),
    path('api/patients/my/', MyPatientsView.as_view(), name='root_my_patients'),
    path('api/', include(router.urls)),
    path('api/devices/', include('devices.urls')),
    path('api/locations/', include('locations.urls')),
    path('api/alerts/', include('alerts.urls')),
]

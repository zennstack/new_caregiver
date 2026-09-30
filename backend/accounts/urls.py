from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, 
    CustomTokenObtainPairView, 
    CustomTokenRefreshView, 
    MeView,
    CaregiverPatientViewSet,
    MyPatientsView,
    MyPairingsView
)

router = DefaultRouter()
router.register(r'pairings', CaregiverPatientViewSet, basename='pairing')

urlpatterns = [
    # Auth Endpoints
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='auth_refresh'),
    path('me/', MeView.as_view(), name='auth_me'),

    # Pairing & Patient Endpoints
    path('patients/my/', MyPatientsView.as_view(), name='my_patients'),
    path('pairings/my/', MyPairingsView.as_view(), name='my_pairings'),
    path('', include(router.urls)),
]

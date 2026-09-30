from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import CaregiverPatient
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    CaregiverPatientSerializer,
    PatientUserSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_data = UserSerializer(user).data
        return Response({
            'message': 'User registered successfully',
            'user': user_data
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (permissions.AllowAny,)

class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = (permissions.AllowAny,)

class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CaregiverPatientViewSet(viewsets.ModelViewSet):
    serializer_class = CaregiverPatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CaregiverPatient.objects.all()
        if user.role == User.ROLE_CAREGIVER:
            return CaregiverPatient.objects.filter(caregiver=user)
        return CaregiverPatient.objects.filter(patient=user)

    def perform_create(self, serializer):
        serializer.save(caregiver=self.request.user)

class MyPatientsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != User.ROLE_CAREGIVER and not user.is_staff:
            return Response(
                {"detail": "Only caregivers can view their paired patients list."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pairings = CaregiverPatient.objects.filter(caregiver=user, status=CaregiverPatient.STATUS_ACTIVE)
        patients = [pairing.patient for pairing in pairings]
        serializer = PatientUserSerializer(patients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MyPairingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == User.ROLE_CAREGIVER:
            pairings = CaregiverPatient.objects.filter(caregiver=user)
        else:
            pairings = CaregiverPatient.objects.filter(patient=user)
            
        serializer = CaregiverPatientSerializer(pairings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

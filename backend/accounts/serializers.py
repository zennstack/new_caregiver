from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import CaregiverPatient

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class PatientUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = ('id', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password', 'role', 'first_name', 'last_name')

    def validate_role(self, value):
        role_upper = value.upper() if value else 'CAREGIVER'
        if role_upper in ['PATIENT', 'USER']:
            return User.ROLE_PATIENT
        elif role_upper == 'CAREGIVER':
            return User.ROLE_CAREGIVER
        else:
            raise serializers.ValidationError("Role must be CAREGIVER or PATIENT.")

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        
        # Support logging in with either username OR email address (case-insensitive)
        if username_or_email:
            user_obj = User.objects.filter(
                Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
            ).first()
            if user_obj:
                attrs[self.username_field] = user_obj.username

        data = super().validate(attrs)
        # Add extra user info to token response
        data['user'] = UserSerializer(self.user).data
        return data

class CaregiverPatientSerializer(serializers.ModelSerializer):
    caregiver_detail = UserSerializer(source='caregiver', read_only=True)
    patient_detail = UserSerializer(source='patient', read_only=True)
    patient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    patient_username = serializers.CharField(write_only=True, required=False, help_text="Target patient username to pair with")

    class Meta:
        model = CaregiverPatient
        fields = ('id', 'caregiver', 'caregiver_detail', 'patient', 'patient_username', 'patient_detail', 'status', 'created_at')
        read_only_fields = ('id', 'caregiver', 'created_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication is required.")

        caregiver_user = request.user
        if caregiver_user.role != User.ROLE_CAREGIVER and not caregiver_user.is_staff:
            raise serializers.ValidationError("Only users with the CAREGIVER role can initiate pairing.")

        patient_user = None
        patient_id = attrs.get('patient')
        patient_username = attrs.get('patient_username')

        if patient_id:
            patient_user = patient_id
        elif patient_username:
            try:
                patient_user = User.objects.get(username__iexact=patient_username.strip())
            except User.DoesNotExist:
                raise serializers.ValidationError({"patient_username": f"Patient username '{patient_username}' not found."})
        else:
            raise serializers.ValidationError({"patient": "Must provide either patient ID or patient_username."})

        # Role check on target patient
        if patient_user.role not in [User.ROLE_PATIENT, User.ROLE_USER]:
            raise serializers.ValidationError({"patient": "Target user is a Caregiver and cannot be paired as a Patient."})

        if caregiver_user == patient_user:
            raise serializers.ValidationError("Caregiver cannot pair with themselves.")

        # Check duplicate pairing
        if CaregiverPatient.objects.filter(caregiver=caregiver_user, patient=patient_user).exists():
            raise serializers.ValidationError("Caregiver is already paired with this patient.")

        attrs['caregiver'] = caregiver_user
        attrs['patient'] = patient_user
        attrs.pop('patient_username', None)
        return attrs

    def create(self, validated_data):
        return super().create(validated_data)

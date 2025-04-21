# users/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'profile')
    
    def get_role(self, obj):
        try:
            return obj.profile.role
        except:
            return 'user'  # Valor por defecto si no tiene perfil
            
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # Actualizar campos del usuario
        instance = super().update(instance, validated_data)
        
        # Actualizar el perfil
        if profile_data:
            profile = instance.profile
            if 'role' in profile_data:
                profile.role = profile_data['role']
                profile.save()
        
        return instance
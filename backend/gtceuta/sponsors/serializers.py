# sponsors/serializers.py

from rest_framework import serializers
from .models import Sponsor

class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'logo', 'url', 'description', 'type', 'tier', 
                  'active', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
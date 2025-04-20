# sponsors/serializers.py

from rest_framework import serializers
from .models import Sponsor

class SponsorSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'description', 'website', 'logo', 'logo_url', 'active', 'order']
    
    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None
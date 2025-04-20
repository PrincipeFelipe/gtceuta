# blog/serializers.py

from rest_framework import serializers
from .models import BlogPost, BlogImage
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class BlogImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogImage
        fields = ['id', 'image', 'caption', 'order', 'created_at']

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_details = UserSerializer(source='author', read_only=True)
    images = BlogImageSerializer(many=True, read_only=True)
    tags = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'content', 'date', 
                  'image', 'images', 'author', 'author_name', 'author_details', 'category', 
                  'tags', 'published', 'featured', 'meta_description', 'last_modified']
        read_only_fields = ['date', 'last_modified']
    
    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
        return None
    
    def validate_tags(self, value):
        """
        Valida que el campo tags sea una cadena que puede convertirse a lista si es necesario
        """
        # Si ya es una cadena, lo dejamos como está
        if isinstance(value, str):
            return value
            
        # Si es una lista, la convertimos a una cadena separada por comas
        if isinstance(value, list):
            return ','.join(value)
            
        return ''
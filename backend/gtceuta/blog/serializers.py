# blog/serializers.py

from rest_framework import serializers
from .models import BlogPost, BlogImage
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class BlogImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogImage
        fields = ['id', 'post', 'image', 'url', 'caption', 'order', 'is_content_image', 'created_at']
        read_only_fields = ['created_at']
    
    def get_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_details = UserSerializer(source='author', read_only=True)
    images = BlogImageSerializer(many=True, read_only=True)
    tags = serializers.CharField(required=False, allow_blank=True)
    content_images = serializers.ListField(
        child=serializers.FileField(max_length=None, allow_empty_file=False),
        write_only=True,
        required=False
    )
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'content', 'date', 
                  'image', 'image_url', 'images', 'author', 'author_name', 
                  'author_details', 'category', 'tags', 'published', 'featured', 
                  'meta_description', 'last_modified', 'content_images']
        read_only_fields = ['date', 'last_modified', 'author_name', 'author_details', 'images']
    
    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
        return None
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
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
    
    def create(self, validated_data):
        # Extraer imágenes de contenido si existen
        content_images = validated_data.pop('content_images', [])
        
        # Crear el post
        post = BlogPost.objects.create(**validated_data)
        
        # Procesar imágenes de contenido
        self._process_content_images(post, content_images)
        
        return post
    
    def update(self, instance, validated_data):
        # Extraer imágenes de contenido si existen
        content_images = validated_data.pop('content_images', [])
        
        # Actualizar el post
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Procesar imágenes de contenido
        if content_images:
            self._process_content_images(instance, content_images)
        
        return instance
    
    def _process_content_images(self, post, images):
        """Procesa las imágenes de contenido para un post"""
        for i, image in enumerate(images):
            BlogImage.objects.create(
                post=post,
                image=image,
                is_content_image=True,
                order=BlogImage.objects.filter(post=post, is_content_image=True).count() + i
            )
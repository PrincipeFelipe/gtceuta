from django.shortcuts import render

# blog/views.py

from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost, BlogImage
from .serializers import BlogPostSerializer, BlogImageSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
import base64
import os
from django.conf import settings
from django.core.files.base import ContentFile
import uuid

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    # Eliminamos lookup_field = 'slug' para usar el ID por defecto
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['published', 'featured', 'category']
    search_fields = ['title', 'content', 'excerpt', 'category', 'tags']
    ordering_fields = ['date', 'title']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(published=True)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """
        Permite subir múltiples imágenes para un post específico.
        """
        post = self.get_object()
        images = request.FILES.getlist('images')
        captions = request.data.getlist('captions')
        
        if not images:
            return Response({"error": "No se han enviado imágenes"}, status=status.HTTP_400_BAD_REQUEST)
        
        created_images = []
        for i, image in enumerate(images):
            caption = captions[i] if i < len(captions) else None
            blog_image = BlogImage.objects.create(
                post=post,
                image=image,
                caption=caption,
                order=BlogImage.objects.filter(post=post).count()
            )
            created_images.append(BlogImageSerializer(blog_image).data)
        
        return Response(created_images, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        """
        Devuelve todas las imágenes asociadas a un post.
        """
        post = self.get_object()
        images = post.images.all()
        serializer = BlogImageSerializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_posts = self.get_queryset().filter(featured=True)
        page = self.paginate_queryset(featured_posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(featured_posts, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def by_slug(self, request):
        """
        Permite consultar un post por su slug
        """
        slug = request.query_params.get('slug')
        if not slug:
            return Response({"error": "El parámetro 'slug' es requerido"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            post = self.get_queryset().get(slug=slug)
            serializer = self.get_serializer(post)
            return Response(serializer.data)
        except BlogPost.DoesNotExist:
            return Response({"error": "Post no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Realizar operaciones adicionales antes de eliminar si es necesario
        response = super().destroy(request, *args, **kwargs)
        # Los signals se encargarán de eliminar los archivos
        return response

class BlogImageViewSet(viewsets.ModelViewSet):
    queryset = BlogImage.objects.all()
    serializer_class = BlogImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.request.query_params.get('post')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def bulk_update_order(self, request):
        """
        Actualiza el orden de múltiples imágenes
        """
        images_data = request.data
        updated_count = 0
        
        for image_data in images_data:
            try:
                image_id = image_data.get('id')
                new_order = image_data.get('order')
                
                if image_id and new_order is not None:
                    image = BlogImage.objects.get(id=image_id)
                    image.order = new_order
                    image.save(update_fields=['order'])
                    updated_count += 1
            except BlogImage.DoesNotExist:
                pass
        
        return Response({
            "message": f"Se actualizaron {updated_count} imágenes",
            "updated_count": updated_count
        })

@api_view(['POST'])
@parser_classes([JSONParser])
def upload_image(request):
    """
    Endpoint para subir imágenes codificadas en base64
    """
    if 'image' not in request.data:
        return Response({'error': 'No se proporcionó ninguna imagen'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_data = request.data['image']
    image_type = request.data.get('type', 'content')  # 'blog' o 'content'
    
    # Extraer la información de base64
    if ';base64,' in image_data:
        format, imgstr = image_data.split(';base64,')
        ext = format.split('/')[-1]
    else:
        return Response({'error': 'Formato de imagen inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generar nombre de archivo y ruta
    filename = f"{uuid.uuid4()}.{ext}"
    
    # Determinar ruta según tipo
    if image_type == 'blog':
        relative_path = os.path.join('blog', filename)
    else:
        relative_path = os.path.join('blog', 'content', filename)
    
    absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
    
    # Asegurarse de que el directorio existe
    os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
    
    # Guardar archivo
    try:
        image = ContentFile(base64.b64decode(imgstr), name=filename)
        with open(absolute_path, 'wb') as f:
            f.write(image.read())
        
        # Construir URL
        image_url = f"{settings.MEDIA_URL}{relative_path}"
        
        return Response({
            'url': image_url,
            'filename': filename
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

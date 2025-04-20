from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import BlogPost, BlogImage
from .serializers import BlogPostSerializer, BlogImageSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
import base64
import os
import uuid
from django.conf import settings
from django.core.files.base import ContentFile

class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
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
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """
        Permite subir múltiples imágenes para un post específico.
        """
        post = self.get_object()
        images = request.FILES.getlist('images')
        captions = request.data.getlist('captions') if 'captions' in request.data else []
        is_content = request.data.get('is_content', 'false').lower() == 'true'
        
        if not images:
            return Response({"error": "No se han enviado imágenes"}, status=status.HTTP_400_BAD_REQUEST)
        
        created_images = []
        for i, image in enumerate(images):
            caption = captions[i] if i < len(captions) else ''
            blog_image = BlogImage.objects.create(
                post=post,
                image=image,
                caption=caption,
                is_content_image=is_content,
                order=BlogImage.objects.filter(post=post, is_content_image=is_content).count()
            )
            serializer = BlogImageSerializer(blog_image, context={'request': request})
            created_images.append(serializer.data)
        
        return Response(created_images, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        """
        Devuelve todas las imágenes asociadas a un post.
        """
        post = self.get_object()
        image_type = request.query_params.get('type', None)
        
        images = post.images.all()
        if image_type == 'content':
            images = images.filter(is_content_image=True)
        elif image_type == 'gallery':
            images = images.filter(is_content_image=False)
            
        serializer = BlogImageSerializer(images, many=True, context={'request': request})
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
        # Los signals se encargan de eliminar los archivos
        response = super().destroy(request, *args, **kwargs)
        return response

class BlogImageViewSet(viewsets.ModelViewSet):
    queryset = BlogImage.objects.all()
    serializer_class = BlogImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = super().get_queryset()
        post_id = self.request.query_params.get('post')
        content_only = self.request.query_params.get('content_only', 'false').lower() == 'true'
        
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        if content_only:
            queryset = queryset.filter(is_content_image=True)
            
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
@permission_classes([IsAuthenticated])
def upload_image(request):
    """
    Endpoint para subir imágenes codificadas en base64
    """
    if 'image' not in request.data:
        return Response({'error': 'No se proporcionó ninguna imagen'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_data = request.data['image']
    image_type = request.data.get('type', 'content')  # 'blog' o 'content'
    post_id = request.data.get('post_id')
    caption = request.data.get('caption', '')
    
    # Extraer la información de base64
    if ';base64,' in image_data:
        format, imgstr = image_data.split(';base64,')
        ext = format.split('/')[-1]
    else:
        return Response({'error': 'Formato de imagen inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generar nombre de archivo único
    filename = f"{uuid.uuid4()}.{ext}"
    
    try:
        # Si se proporciona un ID de post, usar esa estructura de directorio
        if post_id:
            try:
                post = BlogPost.objects.get(id=post_id)
                
                # Determinar la ruta según el tipo de imagen
                if image_type == 'main':
                    # Para imagen principal, usamos siempre el mismo nombre
                    relative_path = os.path.join('blog', post.slug, f"main.{ext}")
                    post.image = relative_path
                    post.save(update_fields=['image'])
                elif image_type == 'content':
                    relative_path = os.path.join('blog', post.slug, 'content', filename)
                    # Crear registro en BlogImage
                    image_obj = BlogImage(
                        post=post,
                        caption=caption,
                        is_content_image=True,
                        order=BlogImage.objects.filter(post=post, is_content_image=True).count()
                    )
                else:  # gallery
                    relative_path = os.path.join('blog', post.slug, 'gallery', filename)
                    # Crear registro en BlogImage
                    image_obj = BlogImage(
                        post=post,
                        caption=caption,
                        is_content_image=False,
                        order=BlogImage.objects.filter(post=post, is_content_image=False).count()
                    )
            except BlogPost.DoesNotExist:
                return Response({'error': 'Post no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Si no hay ID de post, usar una estructura genérica
            if image_type == 'content':
                relative_path = os.path.join('blog', 'content', filename)
            else:
                relative_path = os.path.join('blog', 'temp', filename)
        
        absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        
        # Asegurarse de que el directorio existe
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
        
        # Guardar archivo
        image = ContentFile(base64.b64decode(imgstr), name=filename)
        with open(absolute_path, 'wb') as f:
            f.write(image.read())
        
        # Si estamos creando una imagen de blog, guardar el objeto
        if post_id and image_type != 'main':
            image_obj.image = relative_path
            image_obj.save()
            
            # Para devolver la URL completa
            request_obj = request._request if hasattr(request, '_request') else request
            image_url = request_obj.build_absolute_uri(f"{settings.MEDIA_URL}{relative_path}")
            
            serializer = BlogImageSerializer(image_obj, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Construir URL
        request_obj = request._request if hasattr(request, '_request') else request
        image_url = request_obj.build_absolute_uri(f"{settings.MEDIA_URL}{relative_path}")
        
        return Response({
            'url': image_url,
            'filename': filename,
            'path': relative_path
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

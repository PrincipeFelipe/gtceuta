from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action, api_view, parser_classes, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Sponsor
from .serializers import SponsorSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.files.base import ContentFile
import base64
import uuid
import os
from django.conf import settings

class SponsorViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['active']
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name']
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset
        return queryset.filter(active=True)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """
        Retorna los sponsors agrupados por tipo
        """
        sponsor_type = request.query_params.get('type')
        if not sponsor_type:
            return Response({"error": "El parámetro 'type' es requerido"}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(type=sponsor_type)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update_order(self, request):
        """
        Actualiza el orden de múltiples patrocinadores
        """
        sponsors_data = request.data
        updated_count = 0
        
        for sponsor_data in sponsors_data:
            try:
                sponsor_id = sponsor_data.get('id')
                new_order = sponsor_data.get('order')
                
                if sponsor_id and new_order is not None:
                    sponsor = Sponsor.objects.get(id=sponsor_id)
                    sponsor.order = new_order
                    sponsor.save(update_fields=['order'])
                    updated_count += 1
            except Sponsor.DoesNotExist:
                pass
        
        return Response({
            "message": f"Se actualizaron {updated_count} patrocinadores",
            "updated_count": updated_count
        })
    
    @action(detail=False, methods=['post'])
    def import_sponsors(self, request):
        """
        Importa múltiples sponsors
        """
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
            
        sponsors_data = request.data
        results = {"created": 0, "updated": 0, "errors": 0}
        
        for sponsor_data in sponsors_data:
            try:
                sponsor_id = sponsor_data.pop('id', None)
                
                if sponsor_id:
                    # Actualizar existente
                    try:
                        sponsor = Sponsor.objects.get(id=sponsor_id)
                        serializer = self.get_serializer(sponsor, data=sponsor_data, partial=True)
                        if serializer.is_valid():
                            serializer.save()
                            results["updated"] += 1
                        else:
                            results["errors"] += 1
                    except Sponsor.DoesNotExist:
                        # Crear nuevo con ID específico
                        sponsor_data['id'] = sponsor_id
                        serializer = self.get_serializer(data=sponsor_data)
                        if serializer.is_valid():
                            serializer.save()
                            results["created"] += 1
                        else:
                            results["errors"] += 1
                else:
                    # Crear nuevo
                    serializer = self.get_serializer(data=sponsor_data)
                    if serializer.is_valid():
                        serializer.save()
                        results["created"] += 1
                    else:
                        results["errors"] += 1
            except Exception as e:
                results["errors"] += 1
        
        return Response({
            "message": f"Importación completada: {results['created']} creados, {results['updated']} actualizados, {results['errors']} errores",
            "results": results
        })
    
    @action(detail=False, methods=['get'])
    def export_sponsors(self, request):
        """
        Exporta todos los sponsors
        """
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
            
        queryset = Sponsor.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Los signals se encargarán de eliminar el archivo
        response = super().destroy(request, *args, **kwargs)
        return response

@api_view(['POST'])
@parser_classes([JSONParser])
@permission_classes([IsAuthenticated])
def upload_logo(request):
    """
    Endpoint para subir logos de patrocinadores
    """
    if 'logo' not in request.data:
        return Response({'error': 'No se proporcionó ningún logo'}, status=status.HTTP_400_BAD_REQUEST)
    
    logo_data = request.data['logo']
    sponsor_id = request.data.get('sponsor_id')
    
    # Extraer la información de base64
    if ';base64,' in logo_data:
        format, imgstr = logo_data.split(';base64,')
        ext = format.split('/')[-1]
    else:
        return Response({'error': 'Formato de imagen inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generar nombre de archivo y ruta
        filename = f"{uuid.uuid4()}.{ext}"
        
        if sponsor_id:
            # Si se proporciona un ID de sponsor, usar esa estructura
            try:
                sponsor = Sponsor.objects.get(id=sponsor_id)
                relative_path = os.path.join('sponsors', str(sponsor.id), filename)
                # Actualizar el sponsor
                sponsor.logo = relative_path
                sponsor.save(update_fields=['logo'])
            except Sponsor.DoesNotExist:
                return Response({'error': 'Patrocinador no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Si no hay ID, usar directorio temporal
            relative_path = os.path.join('sponsors', 'temp', filename)
        
        absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        
        # Asegurarse de que el directorio existe
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
        
        # Guardar archivo
        logo = ContentFile(base64.b64decode(imgstr), name=filename)
        with open(absolute_path, 'wb') as f:
            f.write(logo.read())
        
        # Construir URL
        request_obj = request._request if hasattr(request, '_request') else request
        logo_url = request_obj.build_absolute_uri(f"{settings.MEDIA_URL}{relative_path}")
        
        if sponsor_id:
            serializer = SponsorSerializer(sponsor, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({
            'url': logo_url,
            'filename': filename,
            'path': relative_path
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

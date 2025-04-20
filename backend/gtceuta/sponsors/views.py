from django.shortcuts import render

# sponsors/views.py

from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Sponsor
from .serializers import SponsorSerializer

class SponsorViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['active', 'tier', 'type']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'tier', 'order', 'type']
    
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
        Actualiza el orden de múltiples sponsors
        """
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({"error": "No autorizado"}, status=status.HTTP_403_FORBIDDEN)
            
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
        # Realizar operaciones adicionales antes de eliminar si es necesario
        response = super().destroy(request, *args, **kwargs)
        # Los signals se habrán encargado de eliminar el archivo
        return response

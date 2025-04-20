from django.db import models
import os
from django.db.models.signals import pre_delete
from django.dispatch import receiver

class Sponsor(models.Model):
    TYPE_CHOICES = [
        ('patrocinador', 'Patrocinador'),
        ('colaborador', 'Colaborador'),
        ('medio', 'Blog o Medio'),
    ]
    
    TIER_CHOICES = [
        ('platinum', 'Platinum'),
        ('gold', 'Gold'),
        ('silver', 'Silver'),
        ('bronze', 'Bronze'),
    ]
    
    name = models.CharField(max_length=100, verbose_name='Nombre')
    logo = models.ImageField(upload_to='sponsors/', blank=True, null=True, verbose_name='Logo')
    url = models.URLField(blank=True, null=True, verbose_name='URL')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='patrocinador', verbose_name='Tipo')
    tier = models.CharField(max_length=50, choices=TIER_CHOICES, default='bronze', verbose_name='Nivel')
    active = models.BooleanField(default=True, verbose_name='Activo')
    order = models.IntegerField(default=0, verbose_name='Orden')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        ordering = ['type', 'order', 'name']
        verbose_name = "Patrocinador"
        verbose_name_plural = "Patrocinadores"

    def __str__(self):
        return self.name

@receiver(pre_delete, sender=Sponsor)
def delete_sponsor_logo(sender, instance, **kwargs):
    """
    Signal para eliminar físicamente el archivo de imagen del logo cuando se elimina un patrocinador
    """
    try:
        # Comprobar si tiene logo y si el archivo existe
        if instance.logo and instance.logo.path and os.path.isfile(instance.logo.path):
            # Guardar la ruta antes de que se elimine el modelo
            logo_path = instance.logo.path
            # Eliminar el archivo
            os.remove(logo_path)
            print(f"Eliminado archivo de logo: {logo_path}")
            
            # Limpiar directorios vacíos (opcional)
            directory = os.path.dirname(logo_path)
            try:
                if os.path.exists(directory) and len(os.listdir(directory)) == 0:
                    os.rmdir(directory)
                    print(f"Eliminado directorio vacío: {directory}")
            except Exception as e:
                print(f"Error al eliminar directorio: {str(e)}")
    except Exception as e:
        print(f"Error al eliminar logo del patrocinador: {str(e)}")

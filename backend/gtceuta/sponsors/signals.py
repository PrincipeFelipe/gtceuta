import os
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from .models import Sponsor
from .utils import clean_empty_directories

@receiver(pre_delete, sender=Sponsor)
def delete_sponsor_logo(sender, instance, **kwargs):
    """
    Signal para eliminar físicamente el archivo de imagen del logo cuando se elimina un patrocinador
    """
    try:
        # Comprobar si tiene logo y si el archivo existe
        if instance.logo and hasattr(instance.logo, 'path') and os.path.isfile(instance.logo.path):
            # Guardar la ruta antes de que se elimine el modelo
            logo_path = instance.logo.path
            # Eliminar el archivo
            os.remove(logo_path)
            print(f"Eliminado archivo de logo: {logo_path}")
            
            # Limpiar directorios vacíos
            directory = os.path.dirname(logo_path)
            clean_empty_directories(directory)
    except Exception as e:
        print(f"Error al eliminar logo del patrocinador: {str(e)}")

@receiver(pre_save, sender=Sponsor)
def delete_old_logo_on_update(sender, instance, **kwargs):
    """
    Signal para eliminar el logo anterior cuando se actualiza un patrocinador
    """
    if not instance.pk:
        return False  # Si es una instancia nueva, no hay logo anterior que eliminar
    
    try:
        # Obtener la instancia anterior
        old_instance = Sponsor.objects.get(pk=instance.pk)
        # Verificar si se está actualizando el logo
        if old_instance.logo != instance.logo:
            # Eliminar el archivo anterior
            if old_instance.logo and hasattr(old_instance.logo, 'path') and os.path.isfile(old_instance.logo.path):
                old_logo_path = old_instance.logo.path
                os.remove(old_logo_path)
                print(f"Eliminado archivo de logo anterior: {old_logo_path}")
                
                # Limpiar directorios vacíos
                directory = os.path.dirname(old_logo_path)
                clean_empty_directories(directory)
    except Exception as e:
        print(f"Error al eliminar logo anterior: {str(e)}")
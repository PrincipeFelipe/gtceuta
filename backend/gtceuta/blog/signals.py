import os
import shutil
from django.db.models.signals import pre_delete, post_delete
from django.dispatch import receiver
from .models import BlogPost, BlogImage
from .utils import clean_empty_directories

@receiver(pre_delete, sender=BlogPost)
def delete_post_images_directory(sender, instance, **kwargs):
    """
    Eliminar el directorio completo de imágenes cuando se elimina un post
    """
    try:
        # Obtener la ruta del directorio de imágenes
        image_dir = instance.get_image_directory()
        
        # Si existe el directorio, eliminarlo recursivamente
        if image_dir and os.path.exists(image_dir):
            shutil.rmtree(image_dir)
            print(f"Eliminado directorio de imágenes: {image_dir}")
    except Exception as e:
        print(f"Error al eliminar directorio de imágenes: {str(e)}")

@receiver(pre_delete, sender=BlogImage)
def delete_blog_image_file(sender, instance, **kwargs):
    """
    Eliminar el archivo físico de la imagen cuando se elimina un registro BlogImage
    """
    try:
        # Obtener la ruta del archivo
        if instance.image and os.path.isfile(instance.image.path):
            file_path = instance.image.path
            # Eliminar el archivo
            os.remove(file_path)
            print(f"Eliminado archivo de imagen: {file_path}")
            
            # Obtener el directorio padre
            parent_dir = os.path.dirname(file_path)
            # Limpiar directorios vacíos
            clean_empty_directories(parent_dir)
    except Exception as e:
        print(f"Error al eliminar archivo de imagen: {str(e)}")
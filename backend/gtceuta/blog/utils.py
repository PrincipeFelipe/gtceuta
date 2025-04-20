import os
import shutil
from django.conf import settings

def clean_empty_directories(directory):
    """
    Elimina recursivamente directorios vacíos partiendo del directorio dado
    hasta llegar al directorio media/blog
    """
    if not directory or not os.path.exists(directory):
        return
    
    # Comprobar si el directorio está vacío
    if os.path.exists(directory) and not os.listdir(directory):
        try:
            os.rmdir(directory)
            print(f"Eliminado directorio vacío: {directory}")
            
            # Continuar con el directorio padre
            parent_dir = os.path.dirname(directory)
            
            # Detener el proceso cuando llegamos a la raíz de medios o al directorio de blog
            media_root = os.path.join(settings.MEDIA_ROOT, 'blog')
            if parent_dir and os.path.exists(parent_dir) and parent_dir != media_root:
                clean_empty_directories(parent_dir)
        except Exception as e:
            print(f"Error al eliminar directorio vacío: {str(e)}")
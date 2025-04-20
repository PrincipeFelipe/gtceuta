import os

def clean_empty_directories(path):
    """
    Función recursiva para eliminar directorios vacíos
    """
    if not os.path.isdir(path):
        return
    
    # Recorrer todos los elementos del directorio
    for item in os.listdir(path):
        item_path = os.path.join(path, item)
        if os.path.isdir(item_path):
            clean_empty_directories(item_path)
    
    # Comprobar si el directorio está vacío después de la recursión
    if len(os.listdir(path)) == 0:
        os.rmdir(path)
        print(f"Eliminado directorio vacío: {path}")
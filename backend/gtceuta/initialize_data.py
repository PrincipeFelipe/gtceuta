import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gtceuta.settings')
django.setup()

from django.contrib.auth.models import User
from blog.models import BlogPost
from sponsors.models import Sponsor

def initialize_data():
    print("Inicializando datos...")
    
    # Crear usuario administrador si no existe
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@gtceuta.com', 'admin123')
        print("Usuario admin creado con éxito")
    
    # Crear algunos posts de ejemplo
    if BlogPost.objects.count() == 0:
        print("Creando posts de ejemplo...")
        
        BlogPost.objects.create(
            title="Bienvenidos al I GT de Ceuta",
            slug="bienvenidos-al-i-gt-de-ceuta",
            excerpt="Todo lo que necesitas saber sobre el primer Gran Torneo de Warhammer 40.000 en Ceuta.",
            content="<p>¡Estamos encantados de anunciar el primer Gran Torneo oficial de Warhammer 40.000 en Ceuta!</p>",
            published=True,
            featured=True,
            category="ceuta"
        )
    
    # Crear algunos patrocinadores de ejemplo
    if Sponsor.objects.count() == 0:
        print("Creando patrocinadores de ejemplo...")
        
        Sponsor.objects.create(
            name="Kubos Ludika",
            description="Tienda colaboradora del evento",
            url="https://www.kubosludika.com",
            type="patrocinador",
            tier="gold",
            active=True,
            order=1
        )
    
    print("Inicialización completada.")

if __name__ == "__main__":
    initialize_data()
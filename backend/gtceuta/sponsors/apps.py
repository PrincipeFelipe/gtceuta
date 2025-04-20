from django.apps import AppConfig


class SponsorsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sponsors'
    
    def ready(self):
        import sponsors.signals  # Importar los signals cuando la aplicación se inicia

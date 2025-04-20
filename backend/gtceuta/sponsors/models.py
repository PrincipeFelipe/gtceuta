import os
from django.db import models
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from django.conf import settings  # Añade esta importación

def sponsor_logo_path(instance, filename):
    # Las imágenes se guardarán en: media/sponsors/[id]/[nombre_del_archivo]
    # Si el ID no está disponible aún, se usará un placeholder
    if instance.pk:
        return f'sponsors/{instance.pk}/{filename}'
    return f'sponsors/temp/{filename}'

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
    
    name = models.CharField(max_length=200, verbose_name='Nombre')
    logo = models.ImageField(upload_to=sponsor_logo_path, blank=True, null=True, verbose_name='Logo')
    url = models.URLField(blank=True, null=True, verbose_name='URL')
    description = models.TextField(blank=True, null=True, verbose_name='Descripción')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='patrocinador', verbose_name='Tipo')
    tier = models.CharField(max_length=50, choices=TIER_CHOICES, default='bronze', verbose_name='Nivel')
    active = models.BooleanField(default=True, verbose_name='Activo')
    order = models.IntegerField(default=0, verbose_name='Orden')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Patrocinador"
        verbose_name_plural = "Patrocinadores"

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Si es un objeto existente y el logo ha cambiado
        if self.pk:
            try:
                old_sponsor = Sponsor.objects.get(pk=self.pk)
                if old_sponsor.logo and self.logo and old_sponsor.logo != self.logo:
                    # Marcar para eliminar el logo antiguo
                    self._old_logo = old_sponsor.logo
                else:
                    self._old_logo = None
            except Sponsor.DoesNotExist:
                self._old_logo = None
        else:
            self._old_logo = None
        
        # Guardar el objeto
        super().save(*args, **kwargs)
        
        # Si el logo es nuevo y tenemos un ID
        if self.logo and not self.logo.name.startswith(f'sponsors/{self.pk}/'):
            # Obtener el nombre del archivo actual
            old_path = self.logo.path
            filename = os.path.basename(self.logo.name)
            
            # Crear el nuevo path
            new_relative_path = f'sponsors/{self.pk}/{filename}'
            new_path = os.path.join(settings.MEDIA_ROOT, new_relative_path)
            
            # Asegurarse de que el directorio existe
            os.makedirs(os.path.dirname(new_path), exist_ok=True)
            
            # Mover el archivo
            import shutil
            if os.path.exists(old_path):
                if os.path.exists(new_path):
                    os.remove(new_path)
                shutil.copy2(old_path, new_path)
                os.remove(old_path)
                
                # Actualizar el campo logo
                self.logo.name = new_relative_path
                self.save(update_fields=['logo'])
                
                # Eliminar el directorio temporal si existe y está vacío
                temp_dir = os.path.dirname(old_path)
                if os.path.exists(temp_dir) and temp_dir.endswith('/temp') and not os.listdir(temp_dir):
                    shutil.rmtree(temp_dir)

# Signal para eliminar el logo cuando se elimina un patrocinador
@receiver(pre_delete, sender=Sponsor)
def delete_sponsor_logo(sender, instance, **kwargs):
    """Eliminar el archivo físico del logo cuando se elimina un patrocinador"""
    if instance.logo:
        try:
            # Obtener la ruta del directorio
            if instance.logo.path and os.path.isfile(instance.logo.path):
                logo_dir = os.path.dirname(instance.logo.path)
                
                # Eliminar el archivo
                os.remove(instance.logo.path)
                print(f"Eliminado logo: {instance.logo.path}")
                
                # Eliminar el directorio si está vacío
                if os.path.exists(logo_dir) and not os.listdir(logo_dir):
                    import shutil
                    shutil.rmtree(logo_dir)
                    print(f"Eliminado directorio vacío: {logo_dir}")
        except Exception as e:
            print(f"Error al eliminar logo: {str(e)}")

# Signal para eliminar el logo antiguo cuando se actualiza
@receiver(pre_save, sender=Sponsor)
def delete_old_logo(sender, instance, **kwargs):
    """Elimina el logo antiguo cuando se actualiza"""
    if hasattr(instance, '_old_logo') and instance._old_logo:
        try:
            if os.path.isfile(instance._old_logo.path):
                os.remove(instance._old_logo.path)
                print(f"Eliminado logo antiguo: {instance._old_logo.path}")
        except Exception as e:
            print(f"Error al eliminar logo antiguo: {str(e)}")

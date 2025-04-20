import os
import shutil
from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth.models import User
from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver

def post_directory_path(instance, filename):
    # Siempre usar el mismo nombre para la imagen principal
    ext = filename.split('.')[-1]
    return os.path.join('blog', f"{instance.slug}", f"main.{ext}")

def post_gallery_path(instance, filename):
    # Las imágenes de la galería se guardarán en: media/blog/[slug_del_post]/gallery/[nombre_del_archivo]
    return os.path.join('blog', instance.post.slug, 'gallery', filename)

def content_image_path(instance, filename):
    # Las imágenes del contenido se guardarán en: media/blog/[slug_del_post]/content/[nombre_del_archivo]
    return os.path.join('blog', instance.post.slug, 'content', filename)

class BlogPost(models.Model):
    title = models.CharField(max_length=200, verbose_name='Título')
    slug = models.SlugField(unique=True, max_length=200, verbose_name='URL amigable')
    excerpt = models.TextField(blank=True, null=True, verbose_name='Extracto')
    content = models.TextField(verbose_name='Contenido')
    date = models.DateTimeField(default=timezone.now, verbose_name='Fecha')
    image = models.ImageField(upload_to=post_directory_path, blank=True, null=True, verbose_name='Imagen principal')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts', verbose_name='Autor')
    category = models.CharField(max_length=100, blank=True, verbose_name='Categoría')
    tags = models.CharField(max_length=300, blank=True, verbose_name='Etiquetas')
    published = models.BooleanField(default=False, verbose_name='Publicado')
    featured = models.BooleanField(default=False, verbose_name='Destacado')
    meta_description = models.CharField(max_length=160, blank=True, verbose_name='Meta descripción')
    last_modified = models.DateTimeField(auto_now=True, verbose_name='Última modificación')

    class Meta:
        ordering = ['-date']
        verbose_name = "Artículo"
        verbose_name_plural = "Artículos"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Generar el slug antes de guardar si no existe
        if not self.slug:
            self.slug = slugify(self.title)
            
            # Asegurarse de que el slug sea único
            base_slug = self.slug
            counter = 1
            while BlogPost.objects.filter(slug=self.slug).exists():
                self.slug = f"{base_slug}-{counter}"
                counter += 1
        
        # Si es un objeto existente y hay un cambio en el slug
        if self.pk:
            try:
                old_post = BlogPost.objects.get(pk=self.pk)
                if old_post.slug != self.slug and old_post.image:
                    # Si el slug cambió y hay una imagen, moveremos la imagen después
                    self._old_image_path = old_post.image.path if old_post.image else None
                    self._old_slug = old_post.slug
                    self._slug_changed = True
                else:
                    self._slug_changed = False
            except BlogPost.DoesNotExist:
                self._slug_changed = False
        else:
            self._slug_changed = False
            
        super().save(*args, **kwargs)
        
        # Si el slug cambió y había una imagen, mover la imagen al nuevo directorio
        if self._slug_changed and hasattr(self, '_old_image_path') and self._old_image_path:
            try:
                # Obtener el nuevo path
                new_path = self.image.path
                os.makedirs(os.path.dirname(new_path), exist_ok=True)
                
                # Si existe una imagen en la nueva ubicación, eliminarla
                if os.path.exists(new_path):
                    os.remove(new_path)
                
                # Copiar la imagen anterior a la nueva ubicación
                import shutil
                shutil.copy2(self._old_image_path, new_path)
                
                # Actualizar el campo image
                self.image.name = post_directory_path(self, os.path.basename(self._old_image_path))
                self.save(update_fields=['image'])
                
                # Eliminar el directorio antiguo si está vacío
                old_dir = os.path.dirname(self._old_image_path)
                if os.path.exists(old_dir) and not os.listdir(old_dir):
                    shutil.rmtree(old_dir)
            except Exception as e:
                print(f"Error al mover la imagen: {e}")

    def get_image_directory(self):
        """Retorna la ruta del directorio donde se almacenan las imágenes del post"""
        if self.slug:
            return os.path.join('media', 'blog', self.slug)
        return None

    def get_tags_list(self):
        """Convierte la cadena de tags en una lista"""
        if not self.tags:
            return []
        return [tag.strip() for tag in self.tags.split(',') if tag.strip()]

class BlogImage(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='images', verbose_name='Post')
    image = models.ImageField(upload_to=post_gallery_path, verbose_name='Imagen')
    caption = models.CharField(max_length=200, blank=True, verbose_name='Descripción')
    order = models.IntegerField(default=0, verbose_name='Orden')
    is_content_image = models.BooleanField(default=False, verbose_name='Imagen de contenido')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')

    class Meta:
        ordering = ['order']
        verbose_name = 'Imagen del blog'
        verbose_name_plural = 'Imágenes del blog'

    def __str__(self):
        return f"Imagen {self.id} del post '{self.post.title}'"
        
    def save(self, *args, **kwargs):
        # Si es una imagen de contenido, usar la ruta de contenido
        if self.is_content_image:
            if self.image:
                filename = os.path.basename(self.image.name)
                self.image.name = os.path.join('blog', self.post.slug, 'content', filename)
        super().save(*args, **kwargs)

# Signal para eliminar físicamente el directorio de imágenes cuando se elimina un post
@receiver(pre_delete, sender=BlogPost)
def delete_post_images(sender, instance, **kwargs):
    """
    Signal para eliminar físicamente el directorio de imágenes cuando se elimina un post
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

# Signal para eliminar el archivo físico cuando se elimina una imagen
@receiver(pre_delete, sender=BlogImage)
def delete_blog_image_file(sender, instance, **kwargs):
    """
    Eliminar el archivo físico de la imagen cuando se elimina un registro BlogImage
    """
    if instance.image and os.path.isfile(instance.image.path):
        try:
            os.remove(instance.image.path)
            print(f"Eliminado archivo de imagen: {instance.image.path}")
            
            # Limpiar directorios vacíos
            dir_path = os.path.dirname(instance.image.path)
            while dir_path and dir_path != os.path.join(settings.MEDIA_ROOT, 'blog'):
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    print(f"Eliminado directorio vacío: {dir_path}")
                dir_path = os.path.dirname(dir_path)
        except Exception as e:
            print(f"Error al eliminar archivo de imagen: {str(e)}")

# Signal para eliminar la imagen antigua cuando se actualiza
@receiver(pre_save, sender=BlogPost)
def delete_old_image(sender, instance, **kwargs):
    """Elimina la imagen antigua cuando se actualiza la imagen principal"""
    if not instance.pk:
        return
    
    try:
        old_instance = BlogPost.objects.get(pk=instance.pk)
        if old_instance.image and instance.image and old_instance.image != instance.image:
            if os.path.isfile(old_instance.image.path):
                os.remove(old_instance.image.path)
                print(f"Eliminada imagen antigua: {old_instance.image.path}")
    except Exception as e:
        print(f"Error al eliminar imagen antigua: {str(e)}")

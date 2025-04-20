# blog/models.py

from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User
import os
import shutil
from django.db.models.signals import pre_delete
from django.dispatch import receiver

def post_directory_path(instance, filename):
    # Las imágenes se guardarán en: media/blog/[slug_del_post]/[nombre_del_archivo]
    return os.path.join('blog', instance.slug, filename)

def post_gallery_path(instance, filename):
    # Las imágenes de la galería se guardarán en: media/blog/[slug_del_post]/gallery/[nombre_del_archivo]
    return os.path.join('blog', instance.post.slug, 'gallery', filename)

class BlogPost(models.Model):
    title = models.CharField(max_length=255, verbose_name='Título')
    slug = models.SlugField(max_length=255, unique=True)
    excerpt = models.TextField(blank=True, null=True, verbose_name='Extracto')
    content = models.TextField(verbose_name='Contenido')
    date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha')
    image = models.ImageField(upload_to=post_directory_path, blank=True, null=True, verbose_name='Imagen')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Autor')
    category = models.CharField(max_length=100, blank=True, null=True, verbose_name='Categoría')
    tags = models.TextField(blank=True, null=True, verbose_name='Etiquetas')
    published = models.BooleanField(default=False, verbose_name='Publicado')
    featured = models.BooleanField(default=False, verbose_name='Destacado')
    meta_description = models.TextField(blank=True, null=True, verbose_name='Meta descripción')
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
        
        # Si hay un cambio de slug y hay imagen, manejar el cambio de directorio
        if self.pk:
            try:
                old_post = BlogPost.objects.get(pk=self.pk)
                if old_post.slug != self.slug and old_post.image:
                    # Aquí podríamos implementar una migración de archivos,
                    # pero es complejo y podría causar problemas de integridad.
                    # Para una mayor seguridad, es mejor no manipular automáticamente
                    # las imágenes existentes y hacerlo manualmente si es necesario.
                    pass
            except BlogPost.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)

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

class BlogImage(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='images', verbose_name='Post')
    image = models.ImageField(upload_to=post_gallery_path, verbose_name='Imagen')
    caption = models.CharField(max_length=255, blank=True, null=True, verbose_name='Pie de foto')
    order = models.IntegerField(default=0, verbose_name='Orden')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')

    class Meta:
        ordering = ['order']
        verbose_name = "Imagen del blog"
        verbose_name_plural = "Imágenes del blog"

    def __str__(self):
        return f"Imagen {self.order} - {self.post.title}"

@receiver(pre_delete, sender=BlogImage)
def delete_blog_image_file(sender, instance, **kwargs):
    """
    Signal para eliminar físicamente el archivo de imagen cuando se elimina un registro BlogImage
    """
    try:
        # Obtener la ruta del archivo
        if instance.image and os.path.isfile(instance.image.path):
            # Eliminar el archivo
            os.remove(instance.image.path)
            print(f"Eliminado archivo de imagen: {instance.image.path}")
    except Exception as e:
        print(f"Error al eliminar archivo de imagen: {str(e)}")

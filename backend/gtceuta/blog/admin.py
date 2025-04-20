# blog/admin.py

from django.contrib import admin
from .models import BlogPost, BlogImage

class BlogImageInline(admin.TabularInline):
    model = BlogImage
    extra = 1

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'author', 'category', 'published', 'featured')
    list_filter = ('published', 'featured', 'category')
    search_fields = ('title', 'content', 'excerpt', 'author__username')
    readonly_fields = ('date', 'last_modified')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [BlogImageInline]

@admin.register(BlogImage)
class BlogImageAdmin(admin.ModelAdmin):
    list_display = ('post', 'caption', 'order')
    list_filter = ('post',)
    search_fields = ('post__title', 'caption')

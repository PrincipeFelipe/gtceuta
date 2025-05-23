# Generated by Django 5.2 on 2025-04-20 00:27

import blog.models
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpost',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to=blog.models.post_directory_path, verbose_name='Imagen'),
        ),
        migrations.CreateModel(
            name='BlogImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to=blog.models.post_gallery_path, verbose_name='Imagen')),
                ('caption', models.CharField(blank=True, max_length=255, null=True, verbose_name='Pie de foto')),
                ('order', models.IntegerField(default=0, verbose_name='Orden')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='blog.blogpost', verbose_name='Post')),
            ],
            options={
                'verbose_name': 'Imagen del blog',
                'verbose_name_plural': 'Imágenes del blog',
                'ordering': ['order'],
            },
        ),
    ]

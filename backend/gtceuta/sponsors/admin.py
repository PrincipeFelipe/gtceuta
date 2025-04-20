# sponsors/admin.py

from django.contrib import admin
from .models import Sponsor

@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'tier', 'order', 'active')
    list_filter = ('tier', 'active', 'type')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    list_editable = ('order', 'active')
    fieldsets = (
        (None, {
            'fields': ('name', 'logo', 'url', 'description')
        }),
        ('Clasificación', {
            'fields': ('type', 'tier', 'order')
        }),
        ('Estado', {
            'fields': ('active', 'created_at', 'updated_at')
        }),
    )

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Perfil', {'fields': ('perfil', 'foto')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Perfil', {'fields': ('perfil', 'foto')}),
    )
    list_display = ('username', 'email', 'perfil', 'is_staff')

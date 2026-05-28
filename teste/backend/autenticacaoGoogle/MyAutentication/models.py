from django.contrib.auth.models import AbstractUser
from django.db import models


class PerfilEnum(models.TextChoices):
    ORGANIZADOR = 'organizador', 'Organizador'
    USUARIO = 'usuario', 'Usuario'


class User(AbstractUser):
    perfil = models.CharField(max_length=20, choices=PerfilEnum.choices, default=PerfilEnum.USUARIO)
    foto = models.ImageField(upload_to='usuarios/fotos/', null=True, blank=True)

    def __str__(self):
        return self.username

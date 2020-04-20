from django.db import models
import jsonfield

# Create your models here.


class PageData(models.Model):
    page = models.IntegerField(unique=True)
    actions = jsonfield.JSONField(default=[])


class Chat(models.Model):
    messages = jsonfield.JSONField(default=[])


class Users(models.Model):
    username = models.TextField(unique=True)
    cookie = models.TextField(unique=True)











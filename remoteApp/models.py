from django.db import models
import jsonfield

# Create your models here.


class PageData(models.Model):
    page = models.IntegerField(unique=True)
    actions = jsonfield.JSONField(default=[])









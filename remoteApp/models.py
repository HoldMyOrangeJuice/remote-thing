from django.db import models
import jsonfield

# Create your models here.


class PageData(models.Model):
    page = models.IntegerField(unique=True)

    canvas = jsonfield.JSONField(default={})
    text = jsonfield.JSONField(default={})
    bg = jsonfield.JSONField(default=[])
    action_pattern = jsonfield.JSONField(default=[])









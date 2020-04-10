from django.db import models
import jsonfield

# Create your models here.


class PageData(models.Model):
    page = models.IntegerField(unique=True)

    canvas_image = jsonfield.JSONField()
    text = jsonfield.JSONField()
    bg_images = jsonfield.JSONField()
    the_json = jsonfield.JSONField()








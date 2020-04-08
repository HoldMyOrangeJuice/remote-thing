from django.db import models

# Create your models here.


class PageData(models.Model):
    page = models.IntegerField(unique=True)
    canvas_image = models.TextField()
    text = models.TextField()
    # json list
    bg_images = models.TextField()








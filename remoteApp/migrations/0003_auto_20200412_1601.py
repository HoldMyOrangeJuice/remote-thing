# Generated by Django 3.0.4 on 2020-04-12 13:01

from django.db import migrations
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('remoteApp', '0002_pagedata_bg_images'),
    ]

    operations = [
        migrations.AddField(
            model_name='pagedata',
            name='the_json',
            field=jsonfield.fields.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name='pagedata',
            name='bg_images',
            field=jsonfield.fields.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name='pagedata',
            name='canvas_image',
            field=jsonfield.fields.JSONField(default=dict),
        ),
        migrations.AlterField(
            model_name='pagedata',
            name='text',
            field=jsonfield.fields.JSONField(default=dict),
        ),
    ]

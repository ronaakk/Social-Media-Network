# Generated by Django 4.1.3 on 2023-05-30 23:48

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_userprofile_delete_userprofilepicture'),
    ]

    operations = [
        migrations.AddField(
            model_name='tweet',
            name='image',
            field=models.ImageField(blank=True, upload_to='tweet-pictures'),
        ),
        migrations.AlterField(
            model_name='tweet',
            name='date_posted',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]

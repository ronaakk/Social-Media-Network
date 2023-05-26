# Generated by Django 4.1.3 on 2023-05-25 21:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_remove_user_profile_picture_userprofilepicture'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('profile_picture', models.ImageField(default='profile-pictures/default-profile-pic.jpeg', upload_to='profile-pictures')),
                ('bio', models.TextField(blank=True, max_length=150)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='UserProfilePicture',
        ),
    ]

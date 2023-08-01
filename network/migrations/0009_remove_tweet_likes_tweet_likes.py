# Generated by Django 4.1.3 on 2023-07-28 17:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_remove_userprofile_followers_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tweet',
            name='likes',
        ),
        migrations.AddField(
            model_name='tweet',
            name='likes',
            field=models.ManyToManyField(blank=True, default=0, related_name='tweet_likes', to='network.userprofile'),
        ),
    ]
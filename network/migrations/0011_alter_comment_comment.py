# Generated by Django 4.1.3 on 2023-08-04 17:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0010_remove_tweet_likes_like_tweet_likes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='comment',
            field=models.CharField(max_length=100, null=True),
        ),
    ]

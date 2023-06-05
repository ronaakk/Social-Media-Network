from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser, models.Model):
    pass
    
class Tweet(models.Model):
    tweet = models.CharField(blank=False, null=False, max_length=140)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='tweet-pictures', blank=True)
    likes = models.IntegerField(null=True, default=0)
    comments = models.ManyToManyField('Comment', blank=True)
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} posted: '{self.tweet}'"

class Comment(models.Model):
    pass

class UserProfile(models.Model):
    profile_picture = models.ImageField(default="profile-pictures/default-profile-pic.jpeg", upload_to='profile-pictures')
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    bio = models.TextField(blank=True, max_length=150)

    def __str__(self):
        return f"{self.user}: {self.bio}"
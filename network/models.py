from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import os
from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.db.models.signals import post_delete

class User(AbstractUser, models.Model):
    pass
    
class Tweet(models.Model):
    tweet = models.CharField(blank=False, null=False, max_length=140)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='tweet-pictures', blank=True, null=True)
    likes = models.IntegerField(default=0)
    comments = models.ManyToManyField('Comment', blank=True, related_name='tweet_comments')
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} posted: '{self.tweet}'"

@receiver(pre_delete, sender=Tweet)
def delete_tweet_images(sender, instance, **kwargs):
    # Check if the Tweet instance has an associated image
    if instance.image:
        # Get the path to the image file
        image_path = instance.image.path

        # Delete the image file from the media directory
        if os.path.exists(image_path):
            os.remove(image_path)
            
pre_delete.connect(delete_tweet_images, sender=Tweet)

class Comment(models.Model):
    tweet = models.ForeignKey('Tweet', on_delete=models.CASCADE, null=True)
    comment = models.CharField(max_length=100, null=True, blank=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} commented: {self.comment}"

class Like(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    tweet = models.ForeignKey('Tweet', on_delete=models.CASCADE, related_name="tweet_likes")
    date_liked = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked '{self.tweet.tweet}'"

@receiver(post_delete, sender=Like)
def update_tweet_likes(sender, instance, **kwargs):
    # Get the tweet associated with the deleted Like object
    tweet = instance.tweet

    # Update the likes count in the Tweet model
    tweet.likes = Like.objects.filter(tweet=tweet).count()
    tweet.save()

class Reply(models.Model):
    reply = models.CharField(max_length=140, null=True, blank=False)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE, related_name="comment_reply")
    date_posted = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user} replied: '{self.reply}'"

class UserProfile(models.Model):
    profile_picture = models.ImageField(default="profile-pictures/default-profile-pic.jpeg", upload_to='profile-pictures')
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    bio = models.TextField(blank=True, null=True, max_length=150)

    def __str__(self):
        return f"{self.user}: {self.bio}"

class UserRelationship(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    followers = models.ManyToManyField('UserProfile', related_name="followed_by", blank=True)
    following = models.ManyToManyField('UserProfile', related_name="following", blank=True)

    def followers_count(self):
        return self.followers.count()
    
    def following_count(self):
        return self.following.count()
    
    def __str__(self):
        return f"{self.user}: {self.followers_count()} Followers, {self.following_count()} Following"
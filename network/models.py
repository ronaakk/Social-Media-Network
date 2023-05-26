from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.safestring import mark_safe
from django.core.exceptions import ValidationError
from PIL import Image
from django.contrib.auth.validators import ASCIIUsernameValidator


class User(AbstractUser, models.Model):
    pass
    
class Tweet(models.Model):
    tweet = models.CharField(blank=False, null=False, max_length=140)
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    likes = models.IntegerField(null=True, default=0)
    comments = models.ManyToManyField('Comment', blank=True)
    date_posted = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} posted: '{self.tweet}'"

class Comment(models.Model):
    pass

class UserProfile(models.Model):

    # def clean_profile_picture(profile_picture):
    #     # profile_picture = self.cleaned_data.get('profile_picture')
    #     if profile_picture:
    #         try:
    #             img = Image.open(profile_picture)
    #             width, height = img.size

    #             if width < 60 and height < 60:
    #                 raise ValidationError("Picture uploaded must be at least 60x60 pixels.")
    #             if width != height:
    #                 # Resize the image to fit within a 60x60 circle while maintaining aspect ratio
    #                 if width > height:
    #                     left = (width - height) / 2
    #                     right = left + height
    #                     top = 0
    #                     bottom = height
    #                 else:
    #                     top = (height - width) / 2
    #                     bottom = top + width
    #                     left = 0
    #                     right = width
    #                 img = img.crop((left, top, right, bottom))
    #                 img = img.resize((60, 60), Image.ANTIALIAS)
    #         except IOError:
    #             raise ValidationError('The picture uploaded is not a valid image file.')
    #     return profile_picture

    profile_picture = models.ImageField(default="profile-pictures/default-profile-pic.jpeg", upload_to='profile-pictures')
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    bio = models.TextField(blank=True, max_length=150)

    def __str__(self):
        return f"{self.user}: {self.bio}"

    # To view the images easily in admin
    def image_tag(self):
        return mark_safe('<img src="/../../media/%s" width="150" height="150" />' % (self.profile_picture))

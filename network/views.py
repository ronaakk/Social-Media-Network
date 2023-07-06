from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .forms import *
from django.contrib import messages
from PIL import Image
import os
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from django.templatetags.static import static
import datetime
from django.core.files.storage import default_storage

from .models import *

def index(request):
    # If user is logged in
    try:
        user_profile = UserProfile.objects.get(user = request.user)
    except:
        user_profile = None

    return render(request, "network/index.html", {
        "user_profile" : user_profile
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = User.objects.get(username = request.POST["username"]).username
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, "Invalid username and/or password.")
            return render(request, "network/login.html")
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        register_form = UserRegistrationForm(request.POST)
        if register_form.is_valid():
            # This will automatically save the user to the User Model
            user = register_form.save()

            # Also create a new "User Profile" object for each user
            new_user_profile = UserProfile.objects.create(user=user)
            new_user_profile.save()

            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            # All validation errors will be shown to client
            return render(request, "network/register.html", {"register_form": register_form})
    else:
        return render(request, "network/register.html", {"register_form": UserRegistrationForm()})

def change_profile(request):
    user_profile = UserProfile.objects.get(user=request.user)
    if request.method == "POST":
        profile_settings_form = ProfileSettingsForm(request.POST, request.FILES)
        if profile_settings_form.is_valid():
            new_bio = profile_settings_form.cleaned_data['bio']
            # Handle the case where user only inputs a new profile picture and not a bio
            user_profile.bio = new_bio if new_bio else user_profile.bio
            new_profile_pic = request.FILES.get('profile_picture')

            if new_profile_pic:
                try:
                    img = Image.open(new_profile_pic)
                    width, height = img.size

                    if width < 60 and height < 60:
                        raise ValidationError("Picture uploaded must be at least 60x60 pixels.")
                    if width != height:
                        # Resize the image to fit within a 60x60 circle while maintaining aspect ratio
                        if width > height:
                            left = (width - height) / 2
                            right = left + height
                            top = 0
                            bottom = height
                        else:
                            top = (height - width) / 2
                            bottom = top + width
                            left = 0
                            right = width
                        img = img.crop((left, top, right, bottom))
                        img = img.resize((60, 60), Image.ANTIALIAS)

            
                    if new_profile_pic and new_profile_pic.name != user_profile.profile_picture.name:
                        # Delete the old profile picture file IF it isn't the default
                        if user_profile.profile_picture and user_profile.profile_picture.name != "profile-pictures/default-profile-pic.jpeg":
                            # Delete the old pic
                            print("---- {} ----".format(user_profile.profile_picture.name))
                            user_profile.profile_picture.delete()
                            user_profile.profile_picture = new_profile_pic
                        else:
                            user_profile.profile_picture = new_profile_pic
                except IOError:
                    raise ValidationError('The picture uploaded is not a valid image file.')
            else:
                # Keep the existing profile picture
                user_profile.profile_picture = user_profile.profile_picture

            user_profile.save()

            messages.success(request, "Profile changes successfully saved!")
            return render(request, "network/profile-settings.html", {
                "profile_pic_form": ProfileSettingsForm(),
                "user_profile": user_profile
            })
        else:
            print(profile_settings_form.errors)
            return render(request, "network/profile-settings.html", {
                "profile_pic_form": profile_settings_form,
                "user_profile": user_profile
            })
    else:
        return render(request, "network/profile-settings.html", {
            "profile_pic_form": ProfileSettingsForm(),
            "user_profile": user_profile
        })

# Will be handled asynchronously with AJAX
@csrf_exempt
def post_tweet(request):
    if request.method == "POST":

        # Get contents of form
        tweet = request.POST.get("tweet", "").strip()
        image = request.FILES.get("tweet_image")

        # Save the tweet to the model
        new_tweet = Tweet.objects.create(tweet=tweet, user=request.user, image=image)
        new_tweet.save()

        # Generate the URL for the uploaded image
        if image:
            image_url = settings.MEDIA_URL + str(image)
        else:
            image_url = None

        # Retrieve the profile picture of the user to set in tweet
        user = UserProfile.objects.get(user=request.user)
        user_profile_pic = user.profile_picture

        return JsonResponse({
            "message": "Tweet created successfully.", 
            "image_url": image_url, 
            "date_posted": new_tweet.date_posted.strftime("%B %d, %Y"),
            "profile_pic": user_profile_pic.url,
            "logged_in_user": request.user.username
        }, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

def view_profile(request, user_id):

    # Getting the user whos profile was clicked
    user_profile = UserProfile.objects.get(id=user_id)

    try:
        user_logged_in = UserProfile.objects.get(user=request.user)
    except:
        user_logged_in = None
    
    return render(request, "network/user-profile.html", {
        "user_profile": user_profile,
        "user_logged_in": user_logged_in
    })

def load_feed(request, feed):
    if request.method == "GET":

        if feed == "home":
            # Sort the feed by date posted
            feed_posts = Tweet.objects.all().order_by("date_posted")
            # print("---- {} -----".format(feed_posts))
            feed_data = []
            for post in feed_posts:
                # Access the user profile for each profile picture
                user = UserProfile.objects.get(user = post.user)
                profile_pic = user.profile_picture
                feed_data.append({
                    "tweet": post.tweet,
                    "tweet_image_url": post.image.url if post.image else "",
                    "username": post.user.username,
                    "date_posted": post.date_posted.strftime("%B %d, %Y"),
                    "tweet_comments": post.comments.count() if post.comments.exists() else 0,
                    "tweet_likes": post.likes,
                    "tweet_user_profile_pic": profile_pic.url
                })
            return JsonResponse({
                "feed_posts": feed_data, 
                "logged_in_user": request.user.username
                }, status=200, content_type="application/json")

        # Implement this later
        # if feed == "following":
        #     following_feed_posts = Tweet.objects.filter()
            
    else:
        return JsonResponse({"error": "GET request requried."}, status=400, content_type="application/json")
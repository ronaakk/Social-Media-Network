from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
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

                    # Get the old profile picture path (to delete)
                    old_profile_picture_path = user_profile.profile_picture.path
                    if new_profile_pic and old_profile_picture_path != new_profile_pic.path:
                        # Delete the old profile picture file
                        if os.path.exists(old_profile_picture_path):
                            os.remove(old_profile_picture_path)

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

        return JsonResponse({
            "message": "Tweet created successfully.", 
            "image_url": image_url, 
            "date_posted": new_tweet.date_posted.strftime("%B %d, %Y"),
        }, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

# def view_profile(request, user_id):

#     # Getting the user whos profile was clicked
#     user_profile = UserProfile.objects.get(id=user_id)

#     try:
#         user_logged_in = UserProfile.objects.get(user=request.user)
#     except:
#         user_logged_in = None
    
#     return render(request, "network/user-profile.html", {
#         "user_profile": user_profile,
#         "user_logged_in": user_logged_in
#     })

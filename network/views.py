from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .forms import *
from django.contrib import messages

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
    user_profile = UserProfile.objects.get(user = request.user)
    if request.method == "POST":
        profile_settings_form = ProfileSettingsForm(request.POST, request.FILES)
        if profile_settings_form.is_valid():
            new_profile_pic = ProfileSettingsForm.cleaned_data['profile_picture']
            new_bio  = ProfileSettingsForm.cleaned_data['bio']

            if new_profile_pic != user_profile.profile_picture:
                user_profile.profile_picture = new_profile_pic
            
            if new_bio != user_profile.bio:
                user_profile.bio = new_bio

            # Save the user profile only if any changes were made
            if new_profile_pic != user_profile.profile_picture or new_bio != user_profile.bio:
                user_profile.save()

            messages.success(request, "Profile changes successfully saved!")
            return render(request, "network/profile-settings.html")
        else:
            messages.error(request, "The profile picture/bio chosen cannot be added. Ensure it meets the requirements.")
            return render(request, "network/profile-settings.html", {
                "profile_pic_form": profile_settings_form,
                "user_profile": user_profile
            })
    else:
        return render(request, "network/profile-settings.html", {
            "profile_pic_form": ProfileSettingsForm(),
            "user_profile": user_profile
        })
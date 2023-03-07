from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from .forms import *
from django.contrib import messages

from .models import User


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
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
        form = UserRegistrationForm(request.POST)
        if form.is_valid():

            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            confirmation = request.POST['confirmation']

            # Ensure password matches confirmation
            if password != confirmation:
                messages.error(request, 'Passwords must match.')
                return render(request, "network/register.html", {
                    "register_form": form
                })

            # Attempt to create new user (with profile pic)
            try:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()
            except IntegrityError:
                messages.error(request, 'Username already taken.')
                return render(request, "network/register.html", {
                    "register_form": form
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, 'Something went wrong... Please try again!')
            return render(request, "network/register.html", {
                "register_form": form
            })
    else:
        return render(request, "network/register.html", {
            "register_form": UserRegistrationForm()
        })

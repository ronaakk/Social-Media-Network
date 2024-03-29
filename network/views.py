import datetime
import json
import os

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db.models import Count
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, render
from django.templatetags.static import static
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image

from .forms import *
from .models import *


def index(request):
    # If user is logged in
    try:
        user_profile = UserProfile.objects.get(user = request.user)
    except:
        user_profile = None

    return render(request, "network/index.html", {
        "user_profile" : user_profile,
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST.get('username').strip()
        password = request.POST["password"].strip()
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return redirect("index")
        else:
            messages.error(request, "Invalid username and/or password.")
            return render(request, "network/login.html")
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("login"))

def register(request):
    if request.method == "POST":
        register_form = UserRegistrationForm(request.POST)
        if register_form.is_valid():
            # This will automatically save the user to the User Model
            user = register_form.save()

            # Also create a new "UserProfile" and "UserRelationships" object for each user
            new_user_profile = UserProfile.objects.create(user=user)
            new_user_profile.save()

            new_user_relationships = UserRelationship.objects.create(user=user)
            new_user_relationships.save()

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
            image_url = settings.MEDIA_URL + "tweet-pictures/" + str(request.FILES['tweet_image'].name)
        else:
            image_url = None

        print(image_url)

        # Retrieve the profile picture of the user to set in tweet
        user = UserProfile.objects.get(user=request.user)
        user_profile_pic = user.profile_picture

        return JsonResponse({
            "message": "Tweet created successfully.", 
            "tweet_id": new_tweet.id,
            "image_url": image_url, 
            "date_posted": new_tweet.date_posted.strftime("%B %d, %Y"),
            "profile_pic": user_profile_pic.url,
            "logged_in_user": request.user.username
        }, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

def view_profile(request, username):

    if request.method == "GET":

        # Getting the user whos profile was clicked
        clicked_user = User.objects.get(username=username)
        users_profile = UserProfile.objects.get(user = clicked_user)

        users_tweets = Tweet.objects.filter(user = clicked_user).order_by("-date_posted")
        tweet_data = []
        for tweet in users_tweets:
            comments_count = Comment.objects.filter(tweet = tweet).count()
            has_liked = Like.objects.filter(user=request.user, tweet=tweet).exists()
            user = UserProfile.objects.get(user = tweet.user)
            profile_pic = user.profile_picture
            tweet_data.append({
                "tweet": tweet.tweet,
                "tweet_id": tweet.id,
                "tweet_image_url": tweet.image.url if tweet.image else "",
                "username": tweet.user.username,
                "date_posted": tweet.date_posted.strftime("%B %d, %Y"),
                "comments_count": comments_count,
                "tweet_likes": tweet.likes,
                "tweet_user_profile_pic": profile_pic.url,
                "has_liked": has_liked
            })

        users_relationships = UserRelationship.objects.get(user = clicked_user)
        followers_count = users_relationships.followers_count()
        following_count = users_relationships.following_count()
        
        current_user_profile = UserProfile.objects.get(user=request.user) if request.user.is_authenticated else None
        current_user_relationships = UserRelationship.objects.get(user = request.user)
        current_user_following = current_user_relationships.following.all().values_list('user__username', flat=True)

        # Get tweets liked by the current user using prefetch_related
        current_user_likes = Like.objects.filter(user=request.user).prefetch_related('tweet')
        liked_tweet_ids = set(like.tweet.id for like in current_user_likes)
        
        return render(request, "network/user-profile.html", {
            "users_profile": users_profile,
            "users_relationships": users_relationships,
            "followers_count": followers_count,
            "following_count": following_count,
            "users_tweets": tweet_data,
            "user_profile": current_user_profile,
            "current_user_following": current_user_following,
            "current_user_likes": liked_tweet_ids
        })

def home_feed(request):
    if request.method == "GET":
        feed_data = []
        # Sort the feed by date posted
        feed_posts = Tweet.objects.all().order_by("date_posted")
        for post in feed_posts:
            # Access the user profile for each profile picture
            user = UserProfile.objects.get(user = post.user)
            profile_pic = user.profile_picture

            # Get the comment count
            comments_count = Comment.objects.filter(tweet = post).count()

            # Check if the current user has liked the tweet
            if request.user.is_authenticated:
                has_liked = Like.objects.filter(user=request.user, tweet=post).exists()
            else:
                has_liked = False

            feed_data.append({
                "tweet": post.tweet,
                "tweet_id": post.id,
                "tweet_image_url": post.image.url if post.image else "",
                "username": post.user.username,
                "date_posted": post.date_posted.strftime("%B %d, %Y"),
                "tweet_comments": comments_count,
                "tweet_likes": post.likes,
                "tweet_user_profile_pic": profile_pic.url,
                "has_liked": has_liked
            })
        return JsonResponse({
            "feed_posts": feed_data, 
            "logged_in_user": request.user.username if request.user.is_authenticated else None
        }, status=200, content_type="application/json")    
    else:
        return JsonResponse({"error": "GET request requried."}, status=400, content_type="application/json")

def following_feed(request):
    if request.method == "GET":
        feed_data = []
        # Get current user profile and their user relationships (their following)
        current_user_profile = UserProfile.objects.get(user = request.user)
        current_user = UserRelationship.objects.get(user = request.user)

        # Get the users following list
        user_following = current_user.following.all()
        
        # Get all tweets from users list then add to feed_data
        following_feed_posts = Tweet.objects.filter(user__userprofile__in=user_following).order_by("-date_posted")
        for post in following_feed_posts:
            user = post.user
            user_profile = UserProfile.objects.get(user = user)
            profile_pic = user_profile.profile_picture

            # Get the comment count
            comments_count = Comment.objects.filter(tweet = post).count()
            
            # Check if the current user has liked the tweet
            has_liked = Like.objects.filter(user=request.user, tweet=post).exists()

            feed_data.append({
                "id": post.id,
                "tweet": post.tweet,
                "tweet_image_url": post.image.url if post.image else "",
                "user": user,
                "username": user.username,
                "date_posted": post.date_posted.strftime("%B %d, %Y"),
                "tweet_comments": comments_count,
                "tweet_likes": post.likes,
                "tweet_user_profile_pic": profile_pic.url,
                "has_liked": has_liked
            })

        return render(request, "network/following.html", {
            "logged_in_user": request.user.username,
            "user_profile": current_user_profile,
            "feed_posts": feed_data
        })

@login_required(login_url='login')
def follow_user(request, username):
    if request.method == "GET":

        # Get the current user
        new_follower = User.objects.get(username = request.user.username)
        new_follower_profile = UserProfile.objects.get(user = new_follower)
        new_followers_relationships = UserRelationship.objects.get(user = new_follower)

        # Get user who is to be followed
        user_to_follow = User.objects.get(username = username)
        user_to_follow_profile = UserProfile.objects.get(user = user_to_follow)

        # Get their userRelationships model and add the user to their followers list
        user_to_follow = UserRelationship.objects.get(user = user_to_follow)
        user_to_follow.followers.add(new_follower_profile)

        # Add the user_to_follow to the current users following
        new_followers_relationships.following.add(user_to_follow_profile)

        return JsonResponse({
            "message": f"{user_to_follow.user.username} added to {new_follower.username}'s following.",
            "new_follower_count": user_to_follow.followers_count()
        }, status=200, content_type = "application/json")

    else:
        return JsonResponse({"error": "GET request requried."}, status=400, content_type="application/json")

def unfollow_user(request, username):
    if request.method == "GET":

        # Get the current user
        follower_to_remove = User.objects.get(username = request.user.username)
        follower_to_remove_profile = UserProfile.objects.get(user = follower_to_remove)
        follower_to_remove_relationships = UserRelationship.objects.get(user = follower_to_remove)

        # Get user who is displayed currently
        user_displayed = User.objects.get(username = username)
        user_displayed_profile = UserProfile.objects.get(user = user_displayed)

        # Get their userRelationships model and remove the user from their followers list
        user_displayed_relationships = UserRelationship.objects.get(user = user_displayed)
        user_displayed_relationships.followers.remove(follower_to_remove_profile)

        # Remove the user_displayed from the current users following
        follower_to_remove_relationships.following.remove(user_displayed_profile)

        return JsonResponse({
            "message": f"{follower_to_remove.username} removed from {user_displayed.username}'s following.",
            "new_follower_count": user_displayed_relationships.followers_count()
        }, status=200, content_type = "application/json")

    else:
        return JsonResponse({"error": "GET request requried."}, status=400, content_type="application/json")

def edit_tweet(request, tweet_id):
    if request.method == "POST":
        tweet = Tweet.objects.get(id = tweet_id)

        new_tweet_content = request.POST.get("tweet", "").strip()
        new_tweet_image = request.FILES.get("tweet_image")

        existing_image = tweet.image

        tweet.tweet = new_tweet_content
        tweet.image = new_tweet_image if new_tweet_image else existing_image

        tweet.save()

        # Generate the URL for the uploaded image
        if new_tweet_image:
            image_url = settings.MEDIA_URL + "tweet-pictures/" + str(request.FILES['tweet_image'].name)
        else:
            image_url = None

        return JsonResponse({
            "message": "Tweet updated successfully.", 
            "image_url": image_url
        }, status=201)
    else:
        return JsonResponse({"error": "POST request requried."}, status=400, content_type="application/json")

def delete_tweet(request, tweet_id):
    if request.method == "DELETE":
        tweet_to_delete = Tweet.objects.get(id = tweet_id)
        tweet_to_delete.delete()

        return JsonResponse({"message": "Tweet deleted successfully."}, status=200, content_type="application/json")
    else:
        return JsonResponse({"error": "DELETE request requed."}, status=400, content_type="application/json")

@login_required(login_url='login')
def like_tweet(request, tweet_id):
    if request.method == "POST":
        tweet_to_like = Tweet.objects.get(id=tweet_id)
        user = request.user

        # Check if the user has already liked the tweet
        if Like.objects.filter(user=user, tweet=tweet_to_like).exists():
            return JsonResponse({
                "message": "Tweet already liked.",
                "likesCount": tweet_to_like.likes
            }, status=200, content_type="application/json")

        # Update the likes count of the tweet
        tweet_to_like.likes += 1
        tweet_to_like.save()

        new_like = Like.objects.create(user=user, tweet=tweet_to_like)

        return JsonResponse({
            "message": "Tweet liked successfully.",
            "likesCount": tweet_to_like.likes
        }, status=200, content_type="application/json")
    else:
        return JsonResponse({"error": "POST request required."}, status=400, content_type="application/json")

@login_required(login_url='login')
def unlike_tweet(request, tweet_id):
    if request.method == "POST":
        tweet_to_unlike = Tweet.objects.get(id=tweet_id)
        user = request.user

        # Update the likes count of the tweet
        tweet_to_unlike.likes -= 1
        tweet_to_unlike.save()

        Like.objects.filter(user=user, tweet=tweet_to_unlike).delete()

        return JsonResponse({
            "message": "Tweet unliked successfully.",
            "likesCount": tweet_to_unlike.likes
        }, status=200, content_type="application/json")
    else:
        return JsonResponse({"error": "POST request required."}, status=400, content_type="application/json")

def view_comments(request, tweet_id):
    if request.method == "GET":
        # Retrieve info about tweet
        tweet = Tweet.objects.get(id = tweet_id)
        tweet_creator_profile = UserProfile.objects.get(user = tweet.user)

        if tweet.image:
            tweet_image = tweet.image.url
        else:
            tweet_image = None

        # Info about user
        current_user_profile = UserProfile.objects.get(user = request.user)
        has_liked = Like.objects.filter(user = request.user, tweet = tweet)

        # Comments info
        comments_count = Comment.objects.filter(tweet = tweet).count()
        comment_data = []
        comments = Comment.objects.filter(tweet = tweet).order_by("-date_posted")
        for comment in comments:
            # username and user profile pic
            user = UserProfile.objects.get(user = comment.user)
            profile_pic = user.profile_picture
            comment_data.append({
                "id": comment.id,
                "user": comment.user,
                "comment": comment.comment,
                "date_posted": comment.date_posted.strftime("%B %d, %Y"),
                "commentor_username": comment.user.username,
                "commentor_profile_pic": profile_pic.url
            })

        return render(request, "network/comments.html", {
            "logged_in_user": request.user.username,
            "user_profile": current_user_profile,
            "post": tweet,
            "username": tweet.user.username,
            "post_creator_image": tweet_creator_profile.profile_picture.url,
            "current_user_image": current_user_profile.profile_picture.url,
            "likes": tweet.likes,
            "comments_count": comments_count,
            "post_image": tweet_image,
            "has_liked": has_liked,
            "comments": comment_data
        })

def add_comment(request, tweet_id):
    if request.method == "POST":
        tweet = Tweet.objects.get(id = tweet_id)
        comment = request.POST.get('comment', '').strip()

        new_comment = Comment.objects.create(tweet=tweet, user=request.user, comment=comment)
        new_comment.save()

        # Get the new count of comments and pass it to json response
        comments_count = Comment.objects.filter(tweet = tweet).count()

        user_profile = UserProfile.objects.get(user = request.user)
        user_profile_pic = user_profile.profile_picture

        return JsonResponse({
            "message": "Comment added successfully.",
            "profile_pic": user_profile_pic.url,
            "logged_in_user": request.user.username,
            "date_posted": new_comment.date_posted.strftime("%B %d, %Y"),
            "comments_count": comments_count, 
            "comment_id": new_comment.id
        }, status=200, content_type="application/json")
    else:
        return JsonResponse({"error": "POST request required."}, status=400, content_type="application/json")

def delete_comment(request, comment_id):
    if request.method == "POST":
        comment_to_delete = Comment.objects.get(id = comment_id)
        comment_to_delete.delete()

        comment_count = Comment.objects.filter(tweet= comment_to_delete.tweet).count()

        return JsonResponse({"message": "Comment deleted successfully.", "commentsCount": comment_count}, status=200, content_type="application/json")
    else:
        return JsonResponse({"error": "POST request required."}, status=400, content_type="application/json")

def about(request):
    try:
        user_profile = UserProfile.objects.get(user = request.user)
    except:
        user_profile = None

    return render(request, "network/about.html", {
        "user_profile": user_profile,
    })
from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile_settings", views.change_profile, name="change_profile"),
    path("user/<str:username>", views.view_profile, name="view_profile"),
    path("following", views.following_feed, name="following_feed"),
    path("<int:tweet_id>/comments", views.view_comments, name="view_comments"),

    # API Routes (to handle saving, retrieving tweet data through AJAX)
    path("post_tweet/", views.post_tweet, name="post_tweet"),
    path("home", views.home_feed, name="home_feed"),
    path("follow_user/<str:username>", views.follow_user, name="follow_user"),
    path("unfollow_user/<str:username>", views.unfollow_user, name="unfollow_user"),
    path("edit_tweet/<int:tweet_id>", views.edit_tweet, name="edit_tweet"),
    path("delete_tweet/<int:tweet_id>", views.delete_tweet, name="delete_tweet"),
    path("like_tweet/<int:tweet_id>", views.like_tweet, name="like_tweet"),
    path("unlike_tweet/<int:tweet_id>", views.unlike_tweet, name="unlike_tweet"),
    path("<int:tweet_id>/add_comment", views.add_comment, name="add_comment"),
    path("delete_comment/<int:comment_id>", views.delete_comment, name="delete_comment")
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
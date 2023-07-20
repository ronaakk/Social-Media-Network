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

    # API Routes (to handle saving, retrieving tweet data through AJAX)
    path("post_tweet/", views.post_tweet, name="post_tweet"),
    path("home", views.home_feed, name="home_feed"),
    path("follow_user/<str:username>", views.follow_user, name="follow_user"),
    path("unfollow_user/<str:username>", views.unfollow_user, name="unfollow_user"),
    path("edit_tweet/<int:tweet_id>", views.edit_tweet, name="edit_tweet"),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
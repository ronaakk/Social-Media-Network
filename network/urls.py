from django.urls import path
from . import views
# path("user/<int:user_id>", views.view_profile, name="view_profile"),

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile_settings", views.change_profile, name="change_profile"),

    # API Routes (to handle saving, retrieving tweet data)
    path("post_tweet/", views.post_tweet, name="post_tweet"),
]
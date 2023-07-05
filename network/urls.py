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
    # path("user/<int:user_id>", views.view_profile, name="view_profile"),

    # API Routes (to handle saving, retrieving tweet data)
    path("post_tweet/", views.post_tweet, name="post_tweet"),
    path("load_feed/<str:feed>", views.load_feed, name="load_feed"),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
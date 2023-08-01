from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(Tweet)
admin.site.register(Comment)
admin.site.register(Reply)
admin.site.register(UserRelationship)
admin.site.register(Like)
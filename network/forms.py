from django.forms import ModelForm, TextInput, FileInput, ClearableFileInput
from .models import *


class UserRegistrationForm(ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

        widgets = {
            'username': TextInput(
                attrs={'class': 'input form-control', "placeholder": "Username", 'autocomplete': 'off', }),
            'password': TextInput(
                attrs={'class': 'input form-control', "type": 'password', "placeholder": "Password", 'autocomplete': 'off'}),
            'email': TextInput(
                attrs={"class": "input form-control", "type": 'email', "placeholder": "johndoe@gmail.com", 'autocomplete': 'off'}),
        }

class CustomImageWidget(ClearableFileInput):
    template_name = 'register.html'
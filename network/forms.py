from django.forms import ModelForm, TextInput, FileInput, Textarea, ValidationError
from .models import User, UserProfile, Tweet
from django import forms

class UserRegistrationForm(ModelForm):
    confirmation = forms.CharField(
        widget=TextInput(
            attrs={'class': 'input form-control', 'type': 'password', 'placeholder': 'Confirm Password', 'autocomplete': 'off'}
        )
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirmation']
        widgets = {
            'username': TextInput(
                attrs={'class': 'input form-control', "placeholder": "Username", 'autocomplete': 'off'}),
            'password': TextInput(
                attrs={'class': 'input form-control', "type": 'password', "placeholder": "Password", 'autocomplete': 'off'}),
            'email': TextInput(
                attrs={"class": "input form-control", "type": 'email', "placeholder": "johndoe@gmail.com", 'autocomplete': 'off'}),
        }

    # validate form in a clean_{{field_name}}() method
    def clean_confirmation(self):
        password = self.cleaned_data.get('password')
        confirmation = self.cleaned_data.get('confirmation')
        if password != confirmation:
            raise forms.ValidationError('Your password does not match the confirmation.')
        return confirmation

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Username already taken.') 
        return username.strip()
  
    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        # Set the hashed password for the user
        user.set_password(password)
         # Now save the user to the database with hashed pw
        user.save()

        print("Password before hashing:", password)
        print("Hashed password:", user.password)  # Print the hashed password
        return user

class ProfileSettingsForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ['bio', 'profile_picture']
        widgets = {
            'profile_picture': FileInput(
                attrs={'class': 'profile-pic form-control'}
            ),
            'bio': Textarea(
                attrs={'class': 'form-control'}
            )
        }

    # Makes it so that neither the bio or profile picture need to be changed in order to save properly
    def __init__(self, *args, **kwargs):
        super(ProfileSettingsForm, self).__init__(*args, **kwargs)
        self.fields['profile_picture'].required = False
        self.fields['bio'].required = False

class TweetForm(ModelForm):
    class Meta:
        model = Tweet
        fields = ['tweet', 'image']
    
    def __init__(self, *args, **kwargs):
        super(TweetForm, self).__init__(*args, **kwargs)
        self.fields['image'].required = False

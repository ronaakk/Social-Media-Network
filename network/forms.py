from django.forms import ModelForm, TextInput, FileInput, Textarea
from .models import User, UserProfile
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
        fields = ['user', 'bio', 'profile_picture']
        widgets = {
            'profile_picture': FileInput(
                attrs={'class': 'profile-pic form-control'}
            ),
            'user': TextInput(
                attrs={'readonly': 'readonly'}
            ),
            'bio': Textarea(
                attrs={'rows': 5, 'columns':4, 'class': 'form-control'}
            )
        }
document.addEventListener('DOMContentLoaded', () => {
    const bio = document.querySelector('#bio');
    const characterCount = bio.value.length;
    document.getElementById('character-count').textContent = characterCount + "/150";
})

function updateCharacterCount(bio) {
    let characterCount = bio.value.length;
    let characterCountElement = document.getElementById('character-count')
    characterCountElement.textContent = characterCount + '/150';
    updateCharacterCountColor(characterCount, characterCountElement)
}

function updateCharacterCountColor(characterCount, characterCountElement) {
    if (characterCount === 150) {
      characterCountElement.style.color = 'red';
    } else {
      characterCountElement.style.color = 'black';
    }
}

function previewProfilePicture(event) {
  let input = event.target;
  let preview = document.getElementById('profile-picture-preview');
  let errorImageURL = "{% static 'icons/error-icon-32.png' %}";

  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
    };
    reader.onerror = function(e) {
        preview.src = errorImageURL;
    }
    reader.readAsDataURL(input.files[0]);
  } 
}
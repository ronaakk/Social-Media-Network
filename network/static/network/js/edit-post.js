document.addEventListener('DOMContentLoaded', () => {
    
})

function checkCharacterCountEdit(event) {
    const tweetLength = event.value.length;
    const tweet = document.querySelector("#post-content");
  
    if (tweetLength > 140) {
      tweet.style.color = "red";
      disableButtonEdit("save");
    } else if (tweetLength <= 0) {
      tweet.style.color = "";
      disableButtonEdit("save");
    } else {
      tweet.style.color = "";
      enableButtonEdit("save");
    }
}

function disableSaveButton() {
      const saveButton = document.querySelector("#save-button");
      saveButton.disabled = true;
}
  
function enableSaveButton(button) {
    const saveButton = document.querySelector("#save-button");
    saveButton.disabled = false;
}

function autoExpandEdit(element) {
    element.style.height = 'inherit';
    const computedStyle = window.getComputedStyle(element);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);
    element.style.height = element.scrollHeight + borderTop + borderBottom - 30 + 'px';
}

// Function to allow user to edit their posts
function editPost(tweetId) {
    // Select the correct post to edit
    const post = document.getElementById(`post-${tweetId}`);
    const tweetContent = post.querySelector('.tweet');
    const tweetImageContainer = post.querySelector('.tweet-details__image');
    const tweetImageElement = tweetImageContainer.querySelector(".posted-tweet-picture");
    const actionsSection = post.querySelector('.tweet-actions-section');
  
    // Hide the existing tweet content
    tweetContent.style.display = 'none';
  
    // Create an input element for editing the tweet content
    const tweetInput = document.createElement('textarea');
    tweetInput.classList.add('edit-tweet-input');
    tweetInput.id = "tweet-editing";
    tweetInput.value = tweetContent.textContent;
    tweetInput.addEventListener('input', () => {
      autoExpandEdit(tweetInput);
      checkCharacterCountEdit(tweetInput);
    });
  
    // Replace the tweet content with the input element
    tweetContent.parentNode.insertBefore(tweetInput, tweetContent.nextSibling);
  
    // Show the tweet image container if there is an image
    if (tweetImageContainer.style.display !== "none") {
        tweetImageContainer.style.display = 'flex';
    } else {
        tweetImageContainer.style.display = 'none';
        tweetImageElement.style.display = "none";
    }
  
    // Hide the actions section and show the cancel, delete (implement later), and save buttons
    actionsSection.style.display = 'none';
    const saveButton = createSaveButton(tweetId);
    const cancelButton = createCancelButton(tweetId);
    // editSection.parentNode.appendChild(saveButton);
    // editSection.parentNode.appendChild(cancelButton);
}
  
// Function to create the save button for editing a post
function createSaveButton(tweetId) {
    const saveButton = document.createElement('button');
    saveButton.classList.add('save-button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => savePost(tweetId));
    return saveButton;
}
  
// Function to create the cancel button for editing a post
function createCancelButton(tweetId) {
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => cancelEdit(tweetId));
    return cancelButton;
}
  
// Function to save the edited post
function savePost(tweetId) {
    const post = document.getElementById(`post-${tweetId}`);
    const tweetContent = post.querySelector('.tweet');
    const tweetInput = post.querySelector('.edit-tweet-input');

    // Get the edited tweet content
    const newTweetContent = tweetInput.value;

    // Send an AJAX request to update the tweet content on the server
    fetch(`/edit_tweet/${tweetId}/`, {
        method: 'POST',
        body: JSON.stringify({ tweet: newTweetContent }),
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
        }
    })
        .then(response => {
        if (response.ok) {
            // Update the tweet content on the page
            tweetContent.textContent = newTweetContent;

            // Remove the edit input element
            tweetInput.remove();

            // Show the tweet content
            tweetContent.style.display = 'block';

            // Remove the save and cancel buttons
            const saveButton = post.querySelector('.save-button');
            const cancelButton = post.querySelector('.cancel-button');
            saveButton.remove();
            cancelButton.remove();
        } else {
            throw new Error('Failed to save the post');
        }
        })
        .catch(error => {
            console.log(error);
        });
}
  
  // Function to cancel the editing of a post
function cancelEdit(tweetId) {
    const post = document.getElementById(`post-${tweetId}`);
    const tweetContent = post.querySelector('.tweet');
    const tweetInput = post.querySelector('.edit-tweet-input');
    const tweetImageContainer = post.querySelector('.tweet-details__image');
    const editSection = post.querySelector('.edit-section');

    // Show the existing tweet content
    tweetContent.style.display = 'block';

    // Remove the input element
    tweetInput.remove();

    // Hide the tweet image container if there is no image
    if (tweetImageContainer && !tweetImageContainer.querySelector('img')) {
        tweetImageContainer.style.display = 'none';
    }

    // Hide the save and cancel buttons and show the edit button
    const saveButton = post.querySelector('.save-button');
    const cancelButton = post.querySelector('.cancel-button');
    saveButton.remove();
    cancelButton.remove();
    editSection.style.display = 'flex';
}
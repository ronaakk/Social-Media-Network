document.addEventListener('DOMContentLoaded', () => {
     // Remove id's from images
     const tweetImageContainer = document.querySelector('.tweet-details__image');
     const tweetImageElement = tweetImageContainer.querySelector(".posted-tweet-picture");
 
     tweetImageContainer.removeAttribute('id');
     tweetImageElement.removeAttribute('id');
})

function checkCharacterCountEdit(event) {
    const tweetLength = event.value.length;
    const tweet = document.querySelector("#tweet-editing");
  
    if (tweetLength > 140) {
      tweet.style.color = "red";
      disableSaveButton();
    } else if (tweetLength <= 0) {
      tweet.style.color = "";
      disableSaveButton();
    } else {
      tweet.style.color = "";
      enableSaveButton();
    }
}

function disableSaveButton() {
      const saveButton = document.querySelector(".save-button");
      saveButton.disabled = true;
}
  
function enableSaveButton() {
    const saveButton = document.querySelector(".save-button");
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
    const actionsSection = post.querySelector('.tweet-actions-post');
    const originalChildren = Array.from(actionsSection.children);

    // Save existing tweet image in case cancel button is hit
    const existingImage = tweetImageElement.src !== 'http://127.0.0.1:8000/' ? tweetImageElement.src : '';
    const fileName = existingImage.split("/").pop();

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

    // Hide the actions section and show the cancel, delete, and save buttons
    originalChildren.forEach(child => {
        child.style.display = "none";
    })
    actionsSection.id = "tweet-actions-editing";

    // In the case the user doesn't change the picture
    const cancelButton = createCancelButton(tweetId, existingImage);
    let saveButton = createSaveButton(tweetId, fileName);
    const deleteButton = createDeleteButton(tweetId);

    // Show the tweet image container if there is an image
    if (tweetImageContainer.style.display !== "none") {
        tweetImageContainer.style.display = 'flex';
        tweetImageContainer.id = "tweet-image-container";
        tweetImageElement.id = "tweet-picture-editing";

        tweetImageElement.addEventListener('click', () => {
            // Create an input element for editing the tweet image
            const tweetImageFileInput = document.createElement('input');
            tweetImageFileInput.type = 'file';
            tweetImageFileInput.id = "tweet-picture-file-input";
            tweetImageFileInput.style.display = 'none';
            tweetImageFileInput.accept = 'image/*';
        
            // Add the input element to the tweet-details__image div
            tweetImageContainer.appendChild(tweetImageFileInput);
        
            // Add an event listener to the file input
            tweetImageFileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Update the image source with the selected image
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        tweetImageElement.src = e.target.result;
                        const tweetImageFileName = file.name;
                        const newSaveButton = createSaveButton(tweetId, tweetImageFileName);
                        saveButton = newSaveButton;
                    };
                    reader.readAsDataURL(file);
                } 
            });
        
            // Open file picker dialog
            tweetImageFileInput.click();    
        });

        actionsSection.appendChild(cancelButton);
        actionsSection.appendChild(deleteButton);
        actionsSection.appendChild(saveButton);
    } else {
        tweetImageContainer.style.display = 'none';
        tweetImageElement.style.display = "none";

        const newSaveButton = createSaveButton(tweetId);
        saveButton = newSaveButton;
        
        actionsSection.appendChild(cancelButton);
        actionsSection.appendChild(deleteButton);
        actionsSection.appendChild(saveButton);
    }   
}
    
// Function to create the save button for editing a post
function createSaveButton(tweetId, tweetImageFileName) {
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('save-button');
    saveButton.addEventListener('click', () => savePost(tweetId, tweetImageFileName));
    return saveButton;
}
  
// Function to create the cancel button for editing a post
function createCancelButton(tweetId, existingImage) {
    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancel-button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => cancelEdit(tweetId, existingImage));
    return cancelButton;
}

function createDeleteButton(tweetId) {
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        const shouldDelete = window.confirm('Are you sure you want to delete this post?');
        if (shouldDelete) {
            deletePost(tweetId);
        }
    });
    return deleteButton;
}

// Function to save the edited post
function savePost(tweetId, tweetImageFileName = "") {
    const post = document.getElementById(`post-${tweetId}`);
    const tweetContent = post.querySelector('.tweet');
    const tweetImage = post.querySelector('.posted-tweet-picture');
    const newTweetInput = post.querySelector('.edit-tweet-input');

    // Get the edited tweet content
    const newTweetContent = newTweetInput.value;
    if (tweetImageFileName) {
        if (tweetImageFileName.includes(" ")) {
            // Replace spaces with underscores
            file = file.replace(/ /g, "_");
        }
    }

    // Send an AJAX request to update the tweet content on the server
    fetch(`/edit_tweet/${tweetId}`, {
        method: 'POST',
        body: JSON.stringify({ tweet: newTweetContent, tweet_image: tweetImageFileName }),
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
                newTweetInput.remove();

                // Show the tweet content
                tweetContent.style.display = 'flex';

                // Update the source of the image to the new file
                tweetImage.src = `${tweetImageFileName}`;

                removeEditingButtons(tweetId);
            }
            return response.json();
        })
        .catch(error => {
            console.log(error);
        });
}
  
  // Function to cancel the editing of a post
function cancelEdit(tweetId, existingImage) {
    const post = document.getElementById(`post-${tweetId}`);
    const tweetContent = post.querySelector('.tweet');
    const tweetInput = post.querySelector('.edit-tweet-input');
    const tweetImageContainer = post.querySelector('.tweet-details__image');
    const tweetImageElement = tweetImageContainer.querySelector('img');

    // Show the existing tweet content
    tweetContent.style.display = 'flex';

    // Show the existing image (if there is one)
    if (existingImage) {
        tweetImageElement.src = existingImage;
    }
    
    // Remove the input element
    tweetInput.remove();

    // Hide the tweet image container if there is no image
    if (tweetImageContainer && !tweetImageElement) {
        tweetImageContainer.style.display = 'none';
    }

    removeEditingButtons(tweetId);
}

function deletePost(tweetId) {
    fetch(`/delete_tweet/${tweetId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                const post = document.getElementById(`post-${tweetId}`);
                post.remove();
                alert('Tweet deleted successfully!');
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function removeEditingButtons(tweetId) {
    // Remove edit buttons
    const post = document.getElementById(`post-${tweetId}`);
    const saveButton = post.querySelector('.save-button');
    const cancelButton = post.querySelector('.cancel-button');
    const deleteButton = post.querySelector('.delete-button');
    saveButton.remove();
    cancelButton.remove();
    deleteButton.remove();

    // Display the original tweet actions and remove id from tweet-actions
    const tweetActions = post.querySelector(".tweet-actions-post");
    tweetActions.removeAttribute('id');
    const originalActions = post.querySelector(".tweet-actions-section");
    originalActions.style.display = "flex";

    // Remove id's from images
    const tweetImageContainer = post.querySelector('.tweet-details__image');
    const tweetImageElement = tweetImageContainer.querySelector(".posted-tweet-picture");

    tweetImageContainer.removeAttribute('id');
    tweetImageElement.removeAttribute('id');
}
document.addEventListener('DOMContentLoaded', () => {
  const tweet = document.querySelector("#post-content");
  autoExpand(tweet);
  disableButton("post");
  
  // Set the initial preview to "none"
  const preview = document.querySelector("#tweet-picture-preview");
  preview.style.display = "none";
  
  // When the form is submitted
  const tweetForm = document.querySelector("#tweet-form");
  tweetForm.addEventListener('submit', function(event) {

    event.preventDefault();
    // Stops other event listeners of the same type of being called
    event.stopImmediatePropagation();

    const tweetInput = document.getElementById("post-content");
    const tweet = tweetInput.value;

    const tweetImageElement = document.querySelector("#tweet-picture");

    // Access the selected file and if there isn't any files, an empty string
    const tweetImageFile = tweetImageElement.files[0] ? tweetImageElement.files[0]: "";
    
    const userNameInput = document.querySelector("#tweet-username");
    const username = userNameInput.value;

    if (tweet.trim().length > 0) {
      const csrftoken = getCookie('csrftoken');
      const formData = new FormData();
      formData.append('tweet', tweet);  // Add tweet content to FormData
      formData.append('tweet_image', tweetImageFile);  // Add image file to FormData
  
      fetch("/post_tweet/", {
        method: "POST",
        body: formData,
        headers: {
          'X-CSRFToken': csrftoken,
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log(tweetImageFile);

        if (tweetImageFile) {
          file = tweetImageFile.name;
          if (file.includes(" ")) {
            // Replace spaces with underscores
            file = file.replace(/ /g, "_");
          }
          console.log(file);
          addPostToPage(tweet, `/media/tweet-pictures/${file}`, username, data.date_posted);
        } else {
          addPostToPage(tweet, "", username, data.date_posted);
        }

        clearPostSection();
        console.log(data.message);
      })
      .catch(error => {
        console.log(error);
      });
    }
  });

  // Function to clear posting section once user has submitted a tweet
  function clearPostSection() {
    const tweet = document.querySelector("#post-content");
    tweet.value = "";
    
    const previewContainer = document.querySelector("#tweet__image");
    if (previewContainer) {
      deletePreview(previewContainer);
    }

    disableButton("post");
    enableButton("image");
  }

  // Toggle dropdown menu
  // const dropdownToggle = document.getElementById('edit-post');
  // const dropdownMenu = document.querySelector('.dropdown-menu');

  // dropdownToggle.addEventListener('click', function () {
  //     dropdownMenu.classList.toggle('open');
  // });

  // // Close dropdown menu when clicking outside
  // window.addEventListener('click', function (event) {
  //     if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
  //         dropdownMenu.classList.remove('open');
  //     }
  // });

  // // Close dropdown menu when option is selected
  // const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
  // dropdownItems.forEach(function (item) {
  //     item.addEventListener('click', function () {
  //         dropdownMenu.classList.remove('open');
  //     });
  // });
});

// Find the csrf token within the user's browser
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

// Function to prevent default submission with no text and more than one image uploaded
function disableButton(button) {
  if (button === "post") {
    const postButton = document.querySelector("#post-button");
    postButton.disabled = true;
  }
  if (button === "image") {
    const imageButton = document.querySelector("#tweet-picture");
    imageButton.disabled = true;
  }
}

function enableButton(button) {
  if (button === "post") {
    const postButton = document.querySelector("#post-button");
    postButton.disabled = false;
  }
  if (button == "image") {
    const imageButton = document.querySelector("#tweet-picture");
    imageButton.disabled = false;
  }
}
  
// Function to check character count
function checkCharacterCount(event) {
    const tweetLength = event.value.length;
    const tweet = document.querySelector("#post-content");
  
    if (tweetLength > 140) {
      tweet.style.color = "red";
      disableButton("post");
    } else if (tweetLength <= 0) {
      tweet.style.color = "";
      disableButton("post");
    } else {
      tweet.style.color = "";
      enableButton("post");
    }
}
  
// Function to preview tweet image
function previewTweetImage(event) {
  const input = event.target;
  const previewContainer = document.querySelector("#tweet-picture-preview");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {

      // Create a new image preview container
      const newPreviewContainer = document.createElement("img");
      newPreviewContainer.id = "tweet__image";
      newPreviewContainer.src = `${e.target.result}`;

      previewContainer.style.display = "flex";
      previewContainer.addEventListener('click', () => deletePreview(newPreviewContainer));

      const imageContainer = document.querySelector(".image-container");
      imageContainer.appendChild(newPreviewContainer);
      imageContainer.style.display = "flex";

      disableButton("image");
    };
    reader.onerror = function (e) {
      const fileType = input.files[0].type;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
      if (!allowedTypes.includes(fileType)) {
        previewContainer.innerHTML = "";
        previewContainer.style.display = 'none';
        alert("The file uploaded was not a valid image file.");
      }
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    previewContainer.innerHTML = "";
    previewContainer.style.display = 'none';
  }
}

// Function to auto expand textarea to fit all content
function autoExpand(element) {
    element.style.height = 'inherit';
    const computedStyle = window.getComputedStyle(element);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);
    element.style.height = element.scrollHeight + borderTop + borderBottom - 30 + 'px';
}
  
// Function to delete preview and allow user to select a new image
function deletePreview(previewContainer) {

  const imageContainer = previewContainer.parentNode;
  const preview = document.querySelector("#tweet-picture-preview");

  preview.style.display = "none";
  imageContainer.style.display = "none";

  // Remove the image element
  imageContainer.innerHTML = "";

  const uploadInput = document.querySelector("#tweet-picture");

  // Clear the input value
  uploadInput.value = "";

  enableButton("image");
}
  
// Function to add posts to page (and sort them by date added)
function addPostToPage(tweet, tweetImageFile = "", username, date_posted) {
    const feed = document.querySelector(".posts");
    const postTemplate = document.querySelector(".post");
  
    const newPost = postTemplate.cloneNode(true);
    newPost.classList.remove("hidden");
  
    const tweetDetails = newPost.querySelector(".tweet-details");

    const tweetText = tweetDetails.querySelector(".tweet");
    const tweetImageContainer = tweetDetails.querySelector(".tweet-details__image");
    const tweetImageElement = tweetDetails.querySelector(".posted-tweet-picture");
    const usernameElement = tweetDetails.querySelector(".username-post");
    const datePostedElement = newPost.querySelector(".date-posted");
    console.log(date_posted);
    
    tweetImageContainer.style.display = "none";
    tweetImageElement.style.display = "none";
    
    // Setting the image
    if (tweetImageFile && tweetImageFile !== "") {
      tweetImageContainer.style.display = "flex";
      tweetImageElement.src = tweetImageFile;
      tweetImageElement.style.display = "flex";
    } 

    // Setting the date posted
    datePostedElement.textContent = ` • ${date_posted}`;
    
    // Loading the username into the appropriate place
    usernameElement.textContent = username;
    
    // Loading the tweet
    tweetText.textContent = tweet;
  
    feed.insertBefore(newPost, feed.firstChild);
}
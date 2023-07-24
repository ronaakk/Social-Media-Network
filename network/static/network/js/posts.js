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
        if (tweetImageFile) {
          file = tweetImageFile.name;
          if (file.includes(" ")) {
            // Replace spaces with underscores
            file = file.replace(/ /g, "_");
          }
          console.log(file);
          addPostToPage(
            tweet, 
            `/media/tweet-pictures/${file}`, 
            username, 
            data.date_posted, 
            likesCount=0, 
            commentsCount=0, 
            data.profile_pic, 
            data.logged_in_user,
            data.tweet_id);
        } else {
          addPostToPage(
            tweet, 
            "", 
            username, 
            data.date_posted, 
            likesCount=0, 
            commentsCount=0, 
            data.profile_pic, 
            data.logged_in_user,
            data.tweet_id);
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

  function populateHomeFeed() {
    fetch(`/home`, {
      method: "GET",
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      const feedPosts = data.feed_posts;

      feedPosts.forEach(post => {
        addPostToPage(
          post.tweet,
          post.tweet_image_url,
          post.username,
          post.date_posted,
          post.tweet_likes,
          post.tweet_comments,
          post.tweet_user_profile_pic,
          data.logged_in_user,
          post.tweet_id
        );
      });
    })
    .catch(error => {
      console.log(error);
    });
  }
  
  // Call the populateHomeFeed function when the page is loaded to load the home page
  window.addEventListener("load", () => {
    populateHomeFeed();
  })
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
function addPostToPage(tweet, tweetImageFile = "", username, date_posted, likesCount, commentsCount, profilePic, loggedInUser, tweetId) {
    const feed = document.querySelector(".posts");
    const postTemplate = document.querySelector(".post");
  
    const newPost = postTemplate.cloneNode(true);
    newPost.classList.remove("hidden");
    newPost.id = `post-${tweetId}`;
  
    const tweetDetails = newPost.querySelector(".tweet-details");
    const profilePicElement = newPost.querySelector(".tweet-creator");
    const tweetText = tweetDetails.querySelector(".tweet");
    const tweetImageContainer = tweetDetails.querySelector(".tweet-details__image");
    const tweetImageElement = tweetDetails.querySelector(".posted-tweet-picture");
    const usernameElement = tweetDetails.querySelector(".username-post");
    const datePostedElement = newPost.querySelector(".date-posted");
    const tweetLikes = newPost.querySelector(".like-counter");
    const tweetComments = newPost.querySelector(".comment-counter");

    tweetImageContainer.style.display = "none";
    tweetImageElement.style.display = "none";

    // Setting the image
    if (tweetImageFile && tweetImageFile !== "") {
      tweetImageContainer.style.display = "flex";
      tweetImageElement.src = tweetImageFile;
      tweetImageElement.style.display = "flex";
    } else {
      tweetImageElement.src = '';
    }

    // Setting the profile pic
    profilePicElement.src = profilePic;

    // Setting the date posted
    datePostedElement.textContent = ` • ${date_posted}`;
    
    // Loading the username into the appropriate place
    usernameElement.textContent = username;
    
    // Loading the tweet
    tweetText.textContent = tweet;

    // Loading the tweet likes and comments (if any)
    tweetLikes.textContent = likesCount > 1 || likesCount === 0 ? `${likesCount} Likes` : `${likesCount} Like`;
    tweetComments.textContent = commentsCount > 1 || commentsCount === 0 ? `${commentsCount} Comments` : `${commentsCount} Comment`;

    // Checking to see if authenticated user is creator of tweet
    const editSection = tweetDetails.querySelector(".edit-section");
    if (loggedInUser !== username) {
      editSection.style.display = "none";
    } else {
      editSection.style.display = "flex";
      const editButton = editSection.querySelector(".edit-button");
      editButton.dataset.tweetId = tweetId;
      editButton.addEventListener('click', () => {
        editPost(tweetId);
      });
    }

    // Load the correct url
    loadUserUrl(username, newPost);
  
    feed.insertBefore(newPost, feed.firstChild);
}

// Function to load appropriate user url on each post
function loadUserUrl(username, post) {
  const userProfileLinks = post.querySelectorAll(".user-profile-link");
  const baseUrl = "/user/";

  userProfileLinks.forEach(tag => {
    tag.href = baseUrl + username;
  });
}
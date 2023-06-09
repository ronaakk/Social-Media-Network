document.addEventListener('DOMContentLoaded', () => {
    const tweet = document.querySelector("#post-content");
    autoExpand(tweet);
  
    const postButton = document.querySelector("#post-button");
    postButton.disabled = true;
  
    // When the form is submitted
    const tweetForm = document.querySelector("#tweet-form");
    tweetForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const csrftoken = getCookie('csrftoken');
      const formData = new FormData(tweetForm);
      fetch("/post_tweet/", {
        method: "POST",
        body: formData,
        headers: {
          'X-CSRFToken': csrftoken,
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        const tweet = document.querySelector("#post-content").value;
        const tweetImage = document.querySelector("#tweet-picture");
        const userNameInput = document.querySelector("#tweet-username");
        const username = userNameInput.value;
  
        addPostToPage(tweet, tweetImage, username);
      })
      .catch(error => {
        console.log(error);
      });
    });
  
    // Toggle the dropdown menu when the button is clicked (to edit/delete tweet)
    // const dropdownToggle = document.querySelector('#edit-post');
    // dropdownToggle.addEventListener('click', function() {
    //   const dropdownMenu = this.nextElementSibling;
    //   dropdownMenu.classList.toggle('open');
    // });
  
    // // Close the dropdown menu when clicking outside
    // document.addEventListener('click', function(event) {
    //   const dropdowns = document.querySelectorAll('.dropdown');
    //   dropdowns.forEach(dropdown => {
    //     const dropdownMenu = dropdown.querySelector('.dropdown-menu');
    //     if (!dropdown.contains(event.target) && !dropdownMenu.contains(event.target)) {
    //       dropdownMenu.classList.remove('open');
    //     }
    //   });
    // });
  
  });

// Find the csrf token within the user's browser
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}
  
// Function to check character count
function checkCharacterCount(event) {
    const tweetLength = event.value.length;
    const postButton = document.querySelector("#post-button");
    const tweet = document.querySelector("#post-content");
  
    if (tweetLength > 140) {
      tweet.style.color = "red";
      postButton.disabled = true;
    } else if (tweetLength <= 0) {
      tweet.style.color = "";
      postButton.disabled = true;
    } else {
      tweet.style.color = "";
      postButton.disabled = false;
    }
}
  
// Function to preview tweet image
function previewTweetImage(event) {
    const input = event.target;
    const preview = document.querySelector("#tweet-picture-preview");
  
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.style.display = 'flex';
        const imageContainer = document.createElement("div");
        imageContainer.className = "image-container";
        imageContainer.innerHTML = `<img src="${e.target.result}" id="tweet-picture">`;
        imageContainer.addEventListener('click', deletePreview);
        preview.appendChild(imageContainer);
      };
      reader.onerror = function(e) {
        const fileType = input.files[0].type;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!allowedTypes.includes(fileType)) {
          preview.innerHTML = "";
          preview.style.display = 'none';
          alert("The file uploaded was not a valid image file.");
        }
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      preview.innerHTML = "";
      preview.style.display = 'none';
    }
}
  
// Function to auto expand textarea to fit all content
function autoExpand(element) {
    element.style.height = 'inherit';
    const computedStyle = window.getComputedStyle(element);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);
    element.style.height = element.scrollHeight + borderTop + borderBottom + 'px';
}
  
// Function to delete preview and allow user to select a new image
function deletePreview() {
    const imageContainer = this;
    imageContainer.remove();
}
  
// Function to add posts to page (and sort them by date added)
function addPostToPage(tweet, tweetImage = "", username) {
    const feed = document.querySelector(".posts");
    const postTemplate = document.querySelector(".post");
  
    const newPost = postTemplate.cloneNode(true);
    newPost.classList.remove("hidden");
  
    const section = newPost.querySelector(".section-row");
    const tweetDetails = newPost.querySelector(".tweet-details");
    const tweetText = tweetDetails.querySelector(".tweet");
    const tweetImageElement = tweetDetails.querySelector(".tweet-picture");
    const tweetCreator = section.querySelector(".tweet-creator");
  
    const profilePictureUrl = tweetImageElement.dataset.profilePicture;
    tweetCreator.src = profilePictureUrl;
  
    username.textContent = username;
  
    tweetText.textContent = tweet;
    tweetImageElement.src = tweetImage;
  
    feed.insertBefore(newPost, feed.firstChild);
}
  
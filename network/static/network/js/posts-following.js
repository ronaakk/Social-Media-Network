document.addEventListener('DOMContentLoaded', () => {
 
  
});

    
  // Function to add posts to page (and sort them by date added)
  function addPostToPage(tweet, tweetImageFile = "", username, date_posted, likesCount, commentsCount, profilePic, loggedInUser) {
      const feed = document.querySelector(".posts");
      const postTemplate = document.querySelector(".post");
    
      const newPost = postTemplate.cloneNode(true);
      newPost.classList.remove("hidden");
    
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
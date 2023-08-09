document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("load", () => {
        populateHomeFeed();
    })
})

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
          post.tweet_id,
        );
      });
    })
}

function addPostToPage(tweet, tweetImageFile = "", username, date_posted, likesCount, commentsCount, profilePic, loggedInUser = False, tweetId) {
    const feed = document.querySelector(".posts");
    const postTemplate = document.querySelector(".post");
  
    const newPost = postTemplate.cloneNode(true);
    newPost.classList.remove('hidden');
    newPost.id = `post-${tweetId}`;
  
    const tweetDetails = newPost.querySelector(".tweet-details");
    const profilePicElement = newPost.querySelector(".tweet-creator");
    const tweetText = tweetDetails.querySelector(".tweet");
    const usernameElement = tweetDetails.querySelector(".username-post");
    const datePostedElement = newPost.querySelector(".date-posted");
    const tweetLikes = newPost.querySelector(".like-counter");
    const tweetComments = newPost.querySelector(".comment-counter");

    if (tweetImageFile) {
      const tweetImageContainer = tweetDetails.querySelector(".tweet-details__image");
      const tweetImageElement = tweetDetails.querySelector(".posted-tweet-picture");

      tweetImageContainer.style.display = "none";
      tweetImageElement.style.display = "none";
    }

    console.log(tweetDetails);

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

    // Adding appropriate id to like button
    const likeButton = tweetDetails.querySelector(".like-button .material-symbols-outlined");
    likeButton.dataset.tweetId = tweetId;

    // Checking to see whether user has liked the current tweet
    const likeSection = tweetDetails.querySelector(".like-section");

    // Checking to see if authenticated user is creator of tweet
    const editSection = tweetDetails.querySelector(".edit-section");
    if (loggedInUser) {
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
    }
  
    feed.insertBefore(newPost, feed.firstChild);
}
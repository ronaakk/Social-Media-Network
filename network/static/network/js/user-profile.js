// document.addEventListener('DOMContentLoaded', () => {

//     const usersProfile = JSON.parse('{{ users_profile|escapejs|safe }}');
//     const usersTweets = JSON.parse('{{ users_tweets|escapejs|safe }}');
//     const userProfile = JSON.parse('{{ user_profile|escapejs|safe }}');

//     function populateUserProfile(usersProfile, usersTweets) {
//         usersTweets.forEach(tweet => {
//             const feed = document.querySelector(".user-tweets");
//             const postTemplate = document.querySelector(".post-layout");
        
//             const newPost = postTemplate.cloneNode(true);
//             newPost.classList.remove("hidden");
        
//             const tweetDetails = newPost.querySelector(".tweet-details");
//             const profilePicElement = newPost.querySelector(".tweet-creator");
//             const tweetText = tweetDetails.querySelector(".tweet");
//             const tweetImageContainer = tweetDetails.querySelector(".tweet-details__image");
//             const tweetImageElement = tweetDetails.querySelector(".posted-tweet-picture");
//             const usernameElement = tweetDetails.querySelector(".username-post");
//             const datePostedElement = newPost.querySelector(".date-posted");
//             const tweetLikes = newPost.querySelector(".like-counter");
//             const tweetComments = newPost.querySelector(".comment-counter");
            
//             tweetImageContainer.style.display = "none";
//             tweetImageElement.style.display = "none";
        
//             // Setting the image
//             if (tweet.image.url && tweet.image.url !== "") {
//             tweetImageContainer.style.display = "flex";
//             tweetImageElement.src = tweet.image.url;
//             tweetImageElement.style.display = "flex";
//             } 
        
//             // Setting the profile pic
//             profilePicElement.src = usersProfile.profile_picture.url;
        
//             // Setting the date posted
//             datePostedElement.textContent = ` • ${tweet.date_posted}`;
            
//             // Loading the username into the appropriate place
//             usernameElement.textContent = tweet.user.username;
            
//             // Loading the tweet
//             tweetText.textContent = tweet.tweet;
        
//             // Loading the tweet likes and comments (if any)
//             tweetLikes.textContent = tweet.likes > 1 || tweet.likes === 0 ? `${tweet.likes} Likes` : `${tweet.likes} Like`;
//             const commentsCount = tweet.comments.count();
//             tweetComments.textContent = commentsCount > 1 || commentsCount === 0 ? `${commentsCount} Comments` : `${commentsCount} Comment`;
        
//             // Checking to see if authenticated user is creator of tweet
//             const editSection = tweetDetails.querySelector(".edit-section");
//             if (loggedInUser !== username) {
//             editSection.style.display = "none";
//             } else {
//             editSection.style.display = "flex";
//             }
    
//             feed.insertBefore(newPost, feed.firstChild);
//         });
//     }

//     window.addEventListener('load', () => {
//         populateUserProfile(usersProfile, usersTweets);
//     });

// })
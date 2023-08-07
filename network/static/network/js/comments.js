document.addEventListener('DOMContentLoaded', () => {
    const commentSubmit = document.querySelector("#post-button-comment");
    console.log(commentSubmit);
    commentSubmit.disabled = true;
    const tweetId = commentSubmit.dataset.tweetId;
    // commentSubmit.addEventListener('click', addComment(tweetId));
})

// Function to add comment
function addComment(tweetId) {
    const formData = new FormData();
    const commentField = document.querySelector("#comment-content");
    const comment = commentField.textContent;
    formData.append('comment', comment);
    console.log(comment);

    fetch(`/${tweetId}/add_comment`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content_Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            addCommentToPage(comment, data.logged_in_user, data.date_posted, data.comments_count, data.profile_pic);
        })
        .catch(error => {
            console.log(error);
        })
}

// Find the csrf token within the user's browser
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

function checkCharacterCount(event) {
    const commentLength = event.value.length;
    const commentField = document.querySelector("#comment-content");

    if (commentLength === 0) {
        commentField.style.color = '';
        disableCommentButton();
    } else if (commentLength >= 1 && commentLength < 100) {
        commentField.style.color = '';
        enableCommentButton();
    } else {
        commentField.style.color = 'red';
        disableCommentButton();
    }
}

function enableCommentButton() {
    const commentButton = document.querySelector("#post-button-comment");
    commentButton.disabled = false;
}

function disableCommentButton() {
    const commentButton = document.querySelector("#post-button-comment");
    commentButton.disabled = true;
}

// Function to display comment
function addCommentToPage(comment, username, date_posted, commentsCount, profilePic) {
    const comments = document.querySelector(".comments");
    const commentTemplate = document.querySelector(".comment-template");

    const newComment = commentTemplate.cloneNode(true);
    newComment.classList.remove('hidden');

    const profileLinkElement = newComment.querySelectorAll(".user-profile-link");
    const profilePicElement = newComment.querySelector(".tweet-creator");
    const usernameElement = newComment.querySelector(".username-comment");
    const datePostedElement = newComment.querySelector(".date-posted");
    const commentElement = newComment.querySelector(".comment");
    const tweetComments = document.querySelector(".comment-counter");

    // Setting the profile pic
    profilePicElement.src = profilePic;

    // Setting the date posted
    datePostedElement.textContent = ` • ${date_posted}`;

    // Loading the username into the appropriate place
    usernameElement.textContent = username;

    // Loading the comment
    commentElement.textContent = comment;

    // Updating comment counter
    tweetComments.textContent = commentsCount > 1 || commentsCount === 0 ? `${commentsCount} Comments` : `${commentsCount} Comment`;

    // Load correct url for user profile
    loadUserUrl(username, newComment);

    comments.insertBefore(newComment, comments.firstChild);
}

// Function to load appropriate user url on each post
function loadUserUrl(username, post) {
    const userProfileLinks = post.querySelectorAll(".user-profile-link");
    const baseUrl = "/user/";
  
    userProfileLinks.forEach(tag => {
      tag.href = baseUrl + username;
    });
}

// Function to like a tweet?
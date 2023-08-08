document.addEventListener('DOMContentLoaded', () => {
    // Comment functionality
    const commentSubmit = document.querySelector("#post-button-comment");
    commentSubmit.disabled = true;
    const tweetId = commentSubmit.dataset.tweetId;
    commentSubmit.addEventListener('click', () => addComment(tweetId));

    // Deleting comment functionality
    const deleteButton = document.querySelectorAll(".delete-button");
    deleteButton.forEach(button => {
        const commentId = button.dataset.commentId;
        button.addEventListener('click', () => {
            const shouldDelete = window.confirm('Are you sure you want to delete your comment?');
            if (shouldDelete) {
                deleteComment(commentId);
            }
        });
    })

    // Liking functionality
    const likeButton = document.querySelector(".like-button");
    if (likeButton) {
        likeButton.addEventListener('click', () => handleLikeToggle(likeButton));
    }

    function handleLikeToggle(likeButton) {
        const likeIcon = likeButton.querySelector(".material-symbols-outlined");
        const tweetId = likeIcon.dataset.tweetId;
        const parentElement = likeButton.parentNode;
        console.log(tweetId);

        if (parentElement.classList.contains('liked')) {
            unlikePost(tweetId);
        } else {
            likePost(tweetId);
        }
    }

})

// Function to add comment
function addComment(tweetId) {
    const formData = new FormData();
    const commentField = document.querySelector("#comment-content");
    const comment = commentField.value;
    formData.append('comment', comment);

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
            addCommentToPage(comment, data.logged_in_user, data.date_posted, data.comments_count, data.profile_pic, data.comment_id);
            clearCommentField();
        })
        .catch(error => {
            console.log(error);
        })
}

function clearCommentField() {
    const commentField = document.querySelector("#comment-content")
    commentField.value = '';
    disableCommentButton();
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
function addCommentToPage(comment, username, date_posted, commentsCount, profilePic, commentId) {
    const comments = document.querySelector(".comments");
    const commentTemplate = document.querySelector(".comment-template");

    const newComment = commentTemplate.cloneNode(true);
    newComment.classList.remove('hidden');
    newComment.id = `comment-${commentId}`;

    const profilePicElement = newComment.querySelector(".tweet-creator");
    const usernameElement = newComment.querySelector(".username-comment");
    const datePostedElement = newComment.querySelector(".date-posted");
    const commentElement = newComment.querySelector(".comment");
    const tweetComments = document.querySelector(".comment-counter");
    const deleteButton = newComment.querySelector(".delete-button");

    // Setting the profile pic
    profilePicElement.src = profilePic;

    // Setting the date posted
    datePostedElement.textContent = ` • ${date_posted}`;

    // Loading the username into the appropriate place
    usernameElement.textContent = username;

    // Setting the commentId and click listener
    deleteButton.dataset.commentId = commentId;
    deleteButton.addEventListener('click', () => {
        const shouldDelete = window.confirm('Are you sure you want to delete your comment?');
        if (shouldDelete) {
            deleteComment(commentId);
        }
    });

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

// Functions to like/unlike a tweet
function likePost(tweetId) {
    fetch(`/like_tweet/${tweetId}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content_Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // Make the whole like section red by adding 'liked' class
            const post = document.querySelector(`#post-${tweetId}`);
            const likeSection = post.querySelector(".like-section");
            likeSection.classList.add('liked');

            const likeButtonIcon = post.querySelector(".like-button .material-symbols-outlined");
            likeButtonIcon.classList.add('liked');

            // Update the likes count
            const likeCounter = likeSection.querySelector(".like-counter");
            likeCounter.textContent = data.likesCount > 1 || data.likesCount === 0 ? `${data.likesCount} Likes` : `${data.likesCount} Like`;
        })
        .catch(error => {
            console.log(error);
        })
}

function unlikePost(tweetId) {
    fetch(`/unlike_tweet/${tweetId}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content_Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            // Remove liked class
            const post = document.querySelector(`#post-${tweetId}`);
            const likeSection = post.querySelector(".like-section");
            likeSection.classList.remove('liked');

            const likeButton = post.querySelector(".like-button");
            likeButton.classList.remove('liked');

            const likeButtonIcon = post.querySelector(".like-button .material-symbols-outlined");
            likeButtonIcon.classList.remove('liked');

            // Update count
            const likeCounter = likeSection.querySelector(".like-counter");
            likeCounter.textContent = data.likesCount > 1 || data.likesCount === 0 ? `${data.likesCount} Likes` : `${data.likesCount} Like`;
        })
        .catch(error => {
            console.log(error);
        })
}

function deleteComment(commentId) {
    fetch(`/delete_comment/${commentId}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content_Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.commentsCount);
            const comment = document.getElementById(`comment-${commentId}`);
            const commentCounter = document.querySelector(".comment-counter");
            commentCounter.textContent = data.commentsCount > 1 || data.commentsCount === 0 ? `${data.commentsCount} Comments` : `${data.commentsCount} Comment`;
            comment.remove();
        })
        .catch(error => console.log(error));
}
document.addEventListener('DOMContentLoaded', () => {
    const likeIcons = document.querySelectorAll(".like-button .material-symbols-outlined");
    likeIcons.forEach(icon => {
        icon.addEventListener('click', handleLikeToggle);
    })

    function handleLikeToggle(event) {
        console.log('button clicked');
        const likeButton = event.currentTarget;
        const tweetId = likeButton.dataset.tweetId;

        if (likeButton.classList.contains('liked')) {
            unlikePost(tweetId);
        } else {
            likePost(tweetId);
        }
    }
})

// Find the csrf token within the user's browser
function getCookie(name) {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

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
            console.log("---- likePost function started running");
            // Make the whole like section red by adding 'liked' class
            const post = document.querySelector(`#post-${tweetId}`);
            const likeSection = post.querySelector(".like-section");
            likeSection.classList.add('liked');

            const likeButton = post.querySelector(".like-button .material-symbols-outlined");
            likeButton.classList.add('liked');

            // Update the likes count
            const likeCounter = likeSection.querySelector(".like-counter");
            likeCounter.textContent = data.likesCount > 1 || data.likesCount === 0 ? `${data.likesCount} Likes` : `${data.likesCount} Like`;

            console.log(data.likesCount);
            console.log('likePost function finished running. ----');
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
            console.log('---- unlikePost function called');
            // Remove liked class
            const post = document.querySelector(`#post-${tweetId}`);
            const likeSection = post.querySelector(".like-section");
            likeSection.classList.remove('liked');

            const likeButton = post.querySelector(".like-button .material-symbols-outlined");
            likeButton.classList.remove('liked');

            // Update count
            const likeCounter = likeSection.querySelector(".like-counter");
            likeCounter.textContent = data.likesCount > 1 || data.likesCount === 0 ? `${data.likesCount} Likes` : `${data.likesCount} Like`;

            console.log(data.likesCount);
            console.log('unlikePost function finished running. ----');
        })
        .catch(error => {
            console.log(error);
        })
}
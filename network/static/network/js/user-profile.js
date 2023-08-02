document.addEventListener('DOMContentLoaded', () => {
    const actionButton = document.querySelector(".action-button");

    // Only apply if the user is not viewing their own profile
    if (actionButton) {
        actionButton.addEventListener('click', handleFollowToggle);

        // Handle hover effects
        actionButton.addEventListener("mouseenter", () => {
            if (actionButton.classList.contains("following-button")) {
                actionButton.textContent = "Unfollow";
            }
        });

        actionButton.addEventListener("mouseleave", () => {
            if (actionButton.classList.contains("following-button")) {
                actionButton.textContent = "Following";
            }
        });
    }

    // Handle the follow/unfollow toggle
    function handleFollowToggle() {
        const username = document.querySelector(".user-username").textContent;

        if (actionButton.classList.contains("following-button")) {
            unfollowUser(username);
        } else {
            followUser(username);
        }
    }

    // Function to follow a user
    function followUser(username) {
        fetch(`/follow_user/${username}`, {
            method: "GET"
        })
            .then(response => response.json())
            .then(data => {
                actionButton.textContent = "Following";
                actionButton.classList.add("following-button");
                updateFollowersCount(data.new_follower_count);
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Function to unfollow a user
    function unfollowUser(username) {
        fetch(`/unfollow_user/${username}`, {
            method: "GET"
        })
            .then(response => response.json())
            .then(data => {
                actionButton.textContent = "Follow";
                actionButton.classList.remove("following-button");
                updateFollowersCount(data.new_follower_count);
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Function to update the followers count
    function updateFollowersCount(count) {
        const followers = document.querySelector(".followers");
        followers.textContent = `${count} Followers`;
    }
});

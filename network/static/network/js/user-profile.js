// document.addEventListener('DOMContentLoaded', () => {
//     const actionButton = document.querySelector(".action-button");
//     const usernameElement = document.querySelector(".user-username");
//     const username = usernameElement.textContent;
  
//     if (actionButton.textContent === "Follow") {
//         actionButton.addEventListener('click', () => addFollower(username));
//     }
  
//     if (actionButton.textContent === "Following") {

//         actionButton.removeEventListener('click', addFollower);
//         actionButton.addEventListener('click', () => removeFollower(username));
    
//         actionButton.addEventListener("mouseenter", () => {
//           actionButton.textContent = "Unfollow";
//         });
    
//         actionButton.addEventListener("mouseleave", () => {
//           actionButton.textContent = "Following";
//         });
//     }
  
//     function addFollower(username) {
//         fetch(`/follow_user/${username}`, {
//             method: "GET"
//         })
//         .then(response => response.json())
//         .then(data => {
//             const actionButton = document.querySelector(".action-button");
//             actionButton.textContent = "Following";

//             const followers = document.querySelector(".followers");
//             followers.textContent = `${data.new_follower_count} Followers`;

//             console.log(data.message);

//             actionButton.removeEventListener('click', addFollower);
//             actionButton.addEventListener('click', () => removeFollower(username));
//         })
//         .catch(error => {
//             console.error(error);
//         });
//     }
  
//     function removeFollower(username) {
//         fetch(`/unfollow_user/${username}`, {
//             method: "GET"
//         })
//         .then(response => response.json())
//         .then(data => {
//             const actionButton = document.querySelector(".action-button");
//             actionButton.textContent = "Follow";

//             const followers = document.querySelector(".followers");
//             followers.textContent = `${data.new_follower_count} Followers`;

//             console.log(data.message);

//             actionButton.removeEventListener('click', removeFollower);
//             actionButton.addEventListener('click', () => addFollower(username));
//         })
//         .catch(error => {
//             console.error(error);
//         });
//     }
// });
  
document.addEventListener('DOMContentLoaded', () => {
    const actionButton = document.querySelector(".action-button");

    actionButton.addEventListener('click', handleFollowToggle);

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
});

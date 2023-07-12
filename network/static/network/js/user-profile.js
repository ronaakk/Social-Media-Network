document.addEventListener('DOMContentLoaded', () => {

    const actionButton = document.querySelector(".action-button");
    const usernameElement = document.querySelector(".user-username");
    const username = usernameElement.textContent;

    if (actionButton.textContent === "Follow") {
        actionButton.addEventListener('click', addFollower(username));
    }


    function addFollower(username) {
        fetch(`/follow_user/${username}`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response data, e.g., display success message or update UI
            const followButton = document.querySelector(".action-button");
            followButton.textContent = "Following";

            const followers = document.querySelector(".followers");
            followers.textContent = `${data.new_follower_count} Followers`

            console.log(data);

        })
        .catch(error => {
            console.error(error);
        });
    }

})
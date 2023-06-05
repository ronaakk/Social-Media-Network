document.addEventListener('DOMContentLoaded', () => {
    // When the form is submitted
    const tweetForm = document.querySelector("#tweet-form");
    tweetForm.onsubmit = function(event) {
        // Prevent the default form submission
        event.preventDefault();

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
            // Handle the response data
            const tweet = document.querySelector("#post-content").value;
            const tweetImage = document.querySelector("#tweet-picture")
            const posts = document.querySelector(".posts");

        })
        .catch(error => {
            // Handle the errors
            console.log(error);
        });
    };
});

// Function to check character count
function checkCharacterCount(event) {
    const tweetLength = document.querySelector("#post-content").value.length;
    const postButton = document.querySelector("#post-button");
    const tweet = document.querySelector("#post-content");

    console.log(tweetLength);
    if (tweetLength > 140) {
        alert("Your tweet must be less than 140 characters.");
        tweet.style.outline = "rgb(238, 75, 43)";
        postButton.disabled = true;
    } else {
        tweet.style.borderColor = "";
        postButton.disabled = false;
    }
}

// Function to preview tweet image
function previewTweetImage(event) {
    const input = event.target;
    const preview = document.querySelector("#tweet-picture-preview");

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            // This will change the div to be displayed
            preview.style.display = 'flex';
            preview.innerHTML = `<img src="${e.target.result}" id="tweet-picture">`;
        };
        reader.onerror = function(e) {
            // Check the file type
            const fileType = input.files[0].type;
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
          
            if (!allowedTypes.includes(fileType)) {
              // The uploaded file is not an image
              preview.innerHTML = "";
              preview.style.display = 'none';
              alert("The file uploaded was not a valid image file.");
            }
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        // No image has been selected yet
        preview.innerHTML = "";
        preview.style.display = 'none';
    }
}


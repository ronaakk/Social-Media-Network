document.addEventListener('DOMContentLoaded', () => {

    const tweet = document.querySelector("#post-content");
    autoExpand(tweet);

    const postButton = document.querySelector("#post-button");
    postButton.disabled = true;

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
            // Handle the response data (update the UI)
            console.log(data.message);
            const tweet = document.querySelector("#post-content").value;
            const tweetImage = document.querySelector("#tweet-picture");

            // Refer to addPostToPage function
            addPostToPage(tweet, tweetImage)

        })
        .catch(error => {
            // Handle the errors
            console.log(error);
        });
    };
});

// Function to check character count
function checkCharacterCount(event) {
    const tweetLength = event.value.length;
    const postButton = document.querySelector("#post-button");
    const tweet = document.querySelector("#post-content");

    if (tweetLength > 140) {
        tweet.style.color = "red"
        postButton.disabled = true;
    } else if (tweetLength <= 0) {
        tweet.style.color = "";
        postButton.disabled = true;
    } else {
        tweet.style.color = ""
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

            // Create a container for the image and the delete button
            const imageContainer = document.createElement("div");
            imageContainer.className = "image-container";
            imageContainer.innerHTML = `<img src="${e.target.result}" id="tweet-picture">`;

            // Allow user to delete the image and preview a new one
            imageContainer.addEventListener('click', deletePreview);
            
            // Append the image container to the preview
            preview.appendChild(imageContainer);

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

// Function to auto expand textarea to fit all content
function autoExpand(element) {
    element.style.height = 'inherit';
    const computedStyle = window.getComputedStyle(element);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderBottom = parseFloat(computedStyle.borderBottomWidth);
    element.style.height = element.scrollHeight + borderTop + borderBottom + 'px';
}

// Function to delete preview and allow user to select new image
function deletePreview() {
    const imageContainer = this;
    imageContainer.remove();
}

// Function to add posts to page (and sort them by date added)
function addPostToPage(tweet, tweetImage = "") {
    const post = document.querySelector(".post");

}
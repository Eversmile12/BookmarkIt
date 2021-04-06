window.onload = () => {
    chrome.browserAction.setBadgeText({text: ""})
    chrome.runtime.sendMessage({ command: "checkUserLoginStatus" }, (isLoggedIn) => {
        console.log(isLoggedIn)
        uiHandler(isLoggedIn.status)
    });
};

function uiHandler(isLoggedIn) {
    if (isLoggedIn) {
        console.log("generateLoggedInUI called")
        generateLoggedInUI();
    } else {
        generateLoginUI();
    }
}


// This could be a class ui handlers
function generateLoggedInUI(){
    fetch("./views/actions.mustache")
    .then(response => response.text())
    .then(template => {
        var render = Mustache.render(template);
        document.querySelector(".actions-container").innerHTML = render;
        console.log("Mustache actions fetched")
        setLoggedInListeners();
        handleBookmarks();
        setUpSearchBar()
    })
}


function setLoggedInListeners() {
    console.log("setting up logged in listeners")
    const logoutButton = document.querySelector("#logout-btn");
    const bookmarkButton = document.querySelector("#bookmark-btn");
    toggleBookmarkButton()
    const closeBookmarkButton = document.querySelector(
        "#close-bookmark-button"
    );
    const syncBookmarksButton = document.querySelector("#sync-btn");


    logoutButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "SignOutUser" }, (response) => {
            window.location.reload();
        });
    });

    bookmarkButton.addEventListener("click", () => {
        getPageInfo(toggleBookmarkOverlay)
    });

    closeBookmarkButton.addEventListener("click", () => {
        toggleBookmarkOverlay();
    });

    syncBookmarksButton.addEventListener("click", () => {
        chrome.bookmarks.getTree(popBookmarkSyncOverlay);
    })

}



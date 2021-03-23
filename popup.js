window.onload = () => {
    chrome.runtime.sendMessage({ command: "checkUser" }, (response) => {
        uiHandler(response.user);
    });
    
};



function uiHandler(user) {
    if (user) {
        generateLoggedInUI(user);
    } else {
        generateLoginUI();
    }
}






chrome.runtime.onMessage.addListener((message, sender, callback) => {
    uiHandler(message.user);
    callback({
        message: "user handler fired",
    });
});


function generateLoginUI(){
    fetch("./views/login-form.mustache")
    .then(response=>response.text())
    .then(template => {
        //TODO: change user name
        let username;
        chrome.storage.local.get("user", (response) =>{
            if(response.user){
                username = response.user;
            }else{
                username = "User";
            }
            var render = Mustache.render(template, {name:username});
            document.querySelector(".actions-container").innerHTML = render;
            renderAvatar();
            document.querySelector("#signup-redirect").addEventListener("click", () => {
                generateSignUpUI()
            });

            let avatarSelectionButton = document.querySelector(".select-avatar-button");
            let avatarSelectionSubMenu = document.querySelector(".avatar-gender-submenu");
            let submenuIcon = document.querySelector(".dropdown-icon");
            //Add event listener to gender submenu
            avatarSelectionButton.addEventListener("click", e=>{
                avatarSelectionSubMenu.classList.toggle("avatar-gender-submenu-active");
                submenuIcon.classList.toggle("active-submenu");
            })
            const avatarGenderOption = [...document.querySelectorAll(".avatar-gender-option")];
            avatarGenderOption.forEach(genderOption => {
                genderOption.addEventListener("click", (e) => {
                    console.log()
                    chrome.storage.local.set({userGender: e.target.innerText}, ()=>{
                        renderAvatar();
                    })
            })
            })
            
            const loginForm = document.querySelector("#login-form");
            // Add event listener to login form
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = loginForm["login-email"].value;
                const password = loginForm["login-password"].value;

                //Login user
                chrome.runtime.sendMessage(
                    {
                        command: "LoginUser",
                        data: { email: email, password: password },
                    },
                    (response) => {
                        if (response.status == "failed") {
                            displayError(response.message, 1);
                        }
                    }
                );
            });
        })
        
    })
}

function generateSignUpUI(){

    fetch("./views/signup-form.mustache")
    .then(response=>response.text())
    .then(template => {
        var render = Mustache.render(template);
        document.querySelector(".actions-container").innerHTML = render;
        document.querySelector("#signin-redirect").addEventListener("click", () => {
            generateLoginUI()
        });
        const signupForm = document.querySelector("#signup-form");
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = signupForm["signup-email"].value;
            const password = signupForm["signup-password"].value;
        
            chrome.runtime.sendMessage(
                {
                    command: "SignUpUser",
                    data: { email: email, password: password },
                },
                (response) => {
                    if (response.status == "failed") {
                        displayError(response.message, 1);
                    }
                }
            );
        });
    });
}

function generateLoggedInUI(user){
    fetch("./views/actions.mustache")
    .then(response => response.text())
    .then(template => {
        var render = Mustache.render(template);
        document.querySelector(".actions-container").innerHTML = render;
        setLoggedInListeners();
        fetchBookmarks(user);
        setUpSearchBar()
    })
}


function setLoggedInListeners() {
    const logoutButton = document.querySelector("#logout-btn");
    const bookmarkButton = document.querySelector("#bookmark-btn");
    const closeBookmarkButton = document.querySelector(
        "#close-bookmark-button"
    );
    const syncBookmarksButton = document.querySelector("#sync-btn");


    logoutButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "SignOutUser" }, (response) => {
            console.log(response.status);
            window.location.reload();
        });
    });

    bookmarkButton.addEventListener("click", () => {
        popBookmarkOverlay();
    });

    closeBookmarkButton.addEventListener("click", () => {
        toggleBookmarkOverlay();
    });

    syncBookmarksButton.addEventListener("click", () => {
        chrome.bookmarks.getTree(popBookmarkSyncOverlay);
    })

}


function fetchBookmarks(user){
    chrome.runtime.sendMessage(
        { command: "fetchUserBookmarks", data: { uid: user.uid } },
        (response) => {
            if (response.content.length ){
                
                console.log(response.content.length);
                generateBookmarkListItem(response.content);
                
                
            } else {
                console.log("no bookmarks found")
                let emptyList = document.createElement("P");
                emptyList.innerText = "Looks like there are no Bookmarks in there..\n Start by:";
                emptyList.classList.add( "paragraph-text", "margin-bottom-medium");
                const container = document.querySelector(".status-container")
                container.appendChild(emptyList);
                container.style.display = "block"
                container.style.textAlign = "center"
            }
        }
    );
}

async function generateBookmarkListItem(bookmarks){
    let container = document.querySelector(".status-container");
    container.innerHTML = "";

    let bookmarksList = document.createElement("ul");
    bookmarksList.classList.add("bookmark-list");    
    
    bookmarks.forEach(async (bookmark) => {
        const bookmarkItem = document.createElement("LI");
        bookmarkItem.classList.add("bookmark-item");
        
        const bookmarkIcon = document.createElement("img");
        bookmarkIcon.classList.add("bookmark-icon");
        bookmarkIcon.setAttribute("width", "20");
        bookmarkIcon.setAttribute("width", "20");
        if(bookmark.doc_data.bm_icon !== ""){
            bookmarkIcon.setAttribute("src", bookmark.doc_data.bm_icon);
        }else{
            bookmarkIcon.setAttribute("src","./assets/001-no-photos.png" )
        }
       
        bookmarkIcon.setAttribute("alt", "icon of the bookmarked page");


        const bookmarkTitle = document.createElement("P");
        bookmarkTitle.innerText = bookmark.doc_data.bm_title;
        bookmarkTitle.classList.add("bookmark-title");
        
        


        const bookmarkOptionsContainer = document.createElement("div");
        bookmarkOptionsContainer.classList.add("bookmark-options-container")

        const bookmarkOptionsIcon = document.createElement("img")
        bookmarkOptionsIcon.setAttribute("width", "15");
        bookmarkOptionsIcon.setAttribute("height", "15");
        bookmarkOptionsIcon.setAttribute("src", "./assets/menu.png");
        bookmarkOptionsIcon.classList.add("bookmark-menu-icon")

     

        const bookmarkOptionsSubmenu = document.createElement("div")
        bookmarkOptionsSubmenu.classList.add("bookmarks-options-submenu")
        bookmarkOptionsIcon.addEventListener("click", () => {
            bookmarkOptionsSubmenu.classList.toggle("active")
            bookmarkOptionsIcon.classList.toggle("bookmark-menu-icon-active")
        })

        const bookmarkLinkIcon = document.createElement("A");
        bookmarkLinkIcon.setAttribute("href", bookmark.doc_data.bm_url)
        bookmarkLinkIcon.setAttribute("target", "_blank")
        bookmarkLinkIcon.classList.add("icon")

        const linkIcon = document.createElement("img");
        linkIcon.setAttribute("width", "15");
        linkIcon.setAttribute("height", "15");
        linkIcon.setAttribute("src", "./assets/001-external-link-symbol.png");
        linkIcon.classList.add("icon", "margin-bottom-xsmall")
        bookmarkLinkIcon.appendChild(linkIcon)

        const bookmarkCopyLinkIcon = document.createElement("img");
        bookmarkCopyLinkIcon.setAttribute("width", "15");
        bookmarkCopyLinkIcon.setAttribute("height", "15");
        bookmarkCopyLinkIcon.setAttribute("src", "./assets/001-copy.png");
        bookmarkCopyLinkIcon.classList.add("icon", "margin-bottom-xsmall")

        bookmarkCopyLinkIcon.setAttribute("data-url", bookmark.doc_data.bm_url)
        bookmarkCopyLinkIcon.addEventListener("click", (e) =>{
            const str = e.target.dataset.url;
            const el = document.createElement('textarea');
            el.value = str;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el)
            alert("Link copied to the clipboard ")
        })

        const bookmarkDeleteIcon = document.createElement("img");
        bookmarkDeleteIcon.setAttribute("data-id", bookmark.doc_id)
        bookmarkDeleteIcon.setAttribute("width", "15");
        bookmarkDeleteIcon.setAttribute("height", "15");
        bookmarkDeleteIcon.setAttribute("src", "./assets/001-delete.png");
        bookmarkDeleteIcon.classList.add("icon")
        
        bookmarkDeleteIcon.addEventListener("click", (e)=>{
            chrome.runtime.sendMessage({command: "deleteBookmark", data:{docId: e.target.getAttribute("data-id")}}, response =>{
                window.location.reload()
            })
        })

       
        
        bookmarkOptionsSubmenu.appendChild(bookmarkLinkIcon);
        bookmarkOptionsSubmenu.appendChild(bookmarkCopyLinkIcon)
        bookmarkOptionsSubmenu.appendChild(bookmarkDeleteIcon);
        bookmarkOptionsContainer.appendChild(bookmarkOptionsIcon)
        bookmarkOptionsContainer.appendChild(bookmarkOptionsSubmenu)

        bookmarkItem.appendChild(bookmarkOptionsContainer)
        bookmarkItem.appendChild(bookmarkIcon);
        bookmarkItem.appendChild(bookmarkTitle);
        
        bookmarksList.appendChild(bookmarkItem);
        


    });

    container.appendChild(bookmarksList);
    container.style.display = "block";
   
}


function setUpSearchBar(){
    const searchBar = document.createElement("input");
        searchBar.setAttribute("type","text");
        searchBar.setAttribute("placeholder", "search");
        searchBar.classList.add("searchbar");
        document.querySelector(".header-container").appendChild(searchBar)
        searchBar.addEventListener("input", ()=>{
            chrome.storage.local.get(["bookmarks"], (response) =>{
                let bookmarksFiltered = response.bookmarks.filter((bookmark)=>{
                    const searchbarValue = searchBar.value.toLowerCase()
                    if( bookmark.doc_data.bm_tags.toLowerCase().includes(searchbarValue) || bookmark.doc_data.bm_title.toLowerCase().includes(searchbarValue) ){
                        return true;
                    }else{
                        return false;
                    };
                })
                generateBookmarkListItem(bookmarksFiltered)
            })
        })
}


function copyLink(){
    
}


function toggleBookmarkOverlay(pageInfo) {
    const bookmarkOverlay = document.querySelector(
        ".bookmark-container-overlay"
    );
    const mainContainer = document.querySelector(".loggedin-user-container");
    const bookmarkForm = document.querySelector("#details-form");
    let bookmarkOverlayDisplay = bookmarkOverlay.style.display;
        
    if (bookmarkOverlayDisplay == "none") {
        let detailsInput = document.getElementsByClassName("page-detail");
        for (let i = 0; i <= 1; i++) {
            detailsInput[i].value = pageInfo[i];
        }

        //TODO: set character counter
        bookmarkForm.addEventListener("submit", (e) => {
            e.preventDefault();
            bookmarkForm.title.classList.remove("input-error");
            bookmarkForm.url.classList.remove("input-error");
            bookmarkForm.tags.classList.remove("input-error");

            const bmTitle = bookmarkForm.title.value;
            const bmUrl = bookmarkForm.url.value;
            //TODO add tags suggestion
            const bmTags = bookmarkForm.tags.value;
            if (bmTitle === "" || bmUrl === "") {
                console.log("something is missing man");
                if (!bmTitle) {
                    bookmarkForm.title.classList.add("input-error");
                }
                if (!bmUrl) {
                    bookmarkForm.url.classList.add("input-error");
                }
                displayError(
                    "Mh, looks like something it's missing",
                    3,
                    "text-light"
                );
                return;
            }
            const bmFavIcon = pageInfo[2];
            chrome.runtime.sendMessage(
                {
                    command: "addBookmark",
                    data: {
                        title: bmTitle,
                        url: bmUrl,
                        tags: bmTags,
                        favIcon: bmFavIcon,
                    },
                },
                (response) => {
                    console.log(response);
                    window.location.reload();
                }
            );
        });
        bookmarkOverlay.style.display = "block";
        bookmarkOverlay.style.animation = "dragDown 1s forwards";
    } else {
        bookmarkOverlay.style.animation = "dragUp 1s forwards";

        setTimeout(() => {
            bookmarkOverlay.style.display = "none"; }, 1000)
        
    }
}

function popBookmarkOverlay() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let tabTitle = tabs[0].title.substring(0, 40);
        let tabUrl = tabs[0].url;
        let favIcon = tabs[0].favIconUrl;
        let pageInfo = [];
        pageInfo.push(tabTitle);
        pageInfo.push(tabUrl);
        pageInfo.push(favIcon);
        toggleBookmarkOverlay(pageInfo);
    });
}


function displayError(error, type, color) {
    let formContainer = document.querySelector(".form-container");
    if (document.querySelector("#error-message")) {
        formContainer.removeChild(document.querySelector("#error-message"));
    }
    let form = document.querySelector("form");
    const errorMessage = document.createElement("P");
    errorMessage.id = "error-message";
    switch (type) {
        case 1:
            errorMessage.innerText = "🔴 ";
            break;
        case 2:
            errorMessage.innerText = "⚡";
            break;
        case 3:
            errorMessage.innerText = "🤔";
    }
    if (color != "") {
        errorMessage.classList.add(color);
    }
    errorMessage.innerText += error;
    form.parentNode.insertBefore(errorMessage, form.nextSibling);
}


let popBookmarkSyncOverlay = function(bookmarksTree){
    if(bookmarksTree[0].children){
        let data = {};
        let bookMarks = [];
        for(child in bookmarksTree[0].children){            
            bookMarks = logTree(bookmarksTree[0].children[child], bookMarks);
        }
        chrome.storage.local.get(["bookmarks"], (response) => {
            console.log(response.bookmarks);
            data["bookmarks"] = bookMarks.filter(bookmark => {
                let isContainer = false;
                response.bookmarks.forEach(savedBookmark => {               
                    if(savedBookmark.doc_data.bm_url == bookmark.url){
                        console.log(savedBookmark.doc_data.bm_url);
                        console.log(bookmark.url)     
                        isContainer = true;
                    }
                })
                return !isContainer;
            })
            console.log(data.bookmarks);
            fetch("./views/bookmarksSync.mustache")
            .then(response=>response.text())
            .then(template => {
                var render = Mustache.render(template, {data:data});
                const container = document.createElement("div");
                container.classList.add("bookmark-sync-overlay")
                container.innerHTML = render;
    
                document.querySelector("body").appendChild(container);
                document.querySelector(".bookmark-sync-overlay").style.animation = "dragDown 1s forwards";
                let bookmarksToSync = [...document.querySelectorAll(".toSync")]
                document.querySelector("#sync-action-btn").addEventListener("click", syncBookmarks)
                document.querySelector("#close-bookmark-sync-btn").addEventListener("click", closeBookmarkSyncOverlay);
                document.querySelector("#select-all-btn").addEventListener("click", selectAllBookmarkTree);
            })      
        })
       
    }
}

function selectAllBookmarkTree(){
    let bookmarksToSync = [...document.querySelectorAll(".toSync")]
    if(document.querySelector("#select-all-btn").checked == true){
        bookmarksToSync.forEach(bookmarkCheckBox => {
            bookmarkCheckBox.checked = true;
        })  
    }else{
        bookmarksToSync.forEach(bookmarkCheckBox => {
            bookmarkCheckBox.checked = false;
        })  
    }
    
}

function closeBookmarkSyncOverlay(){
    console.log("yo");
    let bookmarkSyncOverlay = document.querySelector(".bookmark-sync-overlay");
    bookmarkSyncOverlay.style.animation = "dragUp 1s forwards";
    setTimeout (()=>{
        document.querySelector("body").removeChild(bookmarkSyncOverlay);
    },1000)
    
}

function syncBookmarks(){
    let bookmarksToSync = [...document.querySelectorAll(".toSync")];
    bookmarksToSync = bookmarksToSync.filter(bookmarksToSync => {
        return bookmarksToSync.checked
    })
    let bookmarkData = [];
    bookmarksToSync.forEach(bookmark => {
        let bookmarkObj = {
            title: bookmark.dataset.title,
            url: bookmark.dataset.url
        }
        bookmarkData.push(bookmarkObj)
    })
    // console.log(bookmarkData);
    if(bookmarksToSync.length > 0){
        chrome.runtime.sendMessage(
            {
                command: "synchUserBookmarks",
                data: {
                    bookmarksData : bookmarkData
                },
            },
            (response) => {
                console.log(response);
                let bookmarkSyncOverlay = document.querySelector(".bookmark-sync-overlay");
                bookmarkSyncOverlay.style.animation = "dragUp 1s forwards";
                setTimeout (()=>{
                    document.querySelector("body").removeChild(bookmarkSyncOverlay);
                    window.location.reload();
                },1000)
            }
        );
    };
}

function logTree(bookmarksItem, bookMarks){
    // console.log("Logging bookmarks Item");
    // console.log(bookmarksItem);
    if(bookmarksItem.children){
        // console.log("##########################################")
        // console.log(bookmarksItem.title);
        // console.log("################################################")
        for(child of bookmarksItem.children){
            bookMarks = logTree(child, bookMarks);
        }
    }if(bookmarksItem.url){
        let bookmark = {};
        // console.log(bookmarksItem.title)
        // console.log(bookmarksItem.url)
        bookmark["title"] = bookmarksItem.title;
        bookmark["url"] = decodeURI(bookmarksItem.url);
        bookMarks.push(bookmark);
    }
    return bookMarks;
}


function renderAvatar(){
    chrome.storage.local.get(["userGender"], response => {
        let profileImage = document.querySelector(".login-form-image");
        let image;
            switch(response.userGender){
                case "Male":
                    image = "assets/male_profile_image.svg"
                    break;
                case "Female":
                    image = "assets/female_profile_image.svg"
                    break;
                case "Other":
                    image = "assets/unicorn_profile_image.svg"
                    break;
                default:
                    image ="assets/male_profile_image.svg"
                    break;
            }
            profileImage.setAttribute("src", image);
    })
}

chrome.storage.onChanged.addListener(handleBookmarks)

function handleBookmarks(){
    chrome.storage.local.get(["ubookmarks"], response => {
        if(response){
            if(response.ubookmarks && response.ubookmarks.length > 0){
                generateBookmarkListItem(response.ubookmarks)
            }else{
                let container = document.querySelector(".status-container");
                container.innerHTML = "";
                let emptyList = document.createElement("P");
                emptyList.innerText = "Looks like there are no Bookmarks in there..\n Start by:";
                emptyList.classList.add( "paragraph-text", "margin-bottom-medium");
                container.appendChild(emptyList);
                container.style.display = "block"
                container.style.textAlign = "center"
            }
        }
    })
}

function generateBookmarkListItem(bookmarks){
    let container = document.querySelector(".status-container");
    container.innerHTML = "";

    let bookmarksList = document.createElement("ul");
    bookmarksList.classList.add("bookmark-list");    
    bookmarks.forEach((bookmark) => {
        if(bookmark){        
        const bookmarkItem = document.createElement("LI");
        bookmarkItem.classList.add("bookmark-item");
        
        const bookmarkIcon = document.createElement("img");
        bookmarkIcon.classList.add("bookmark-icon");
        bookmarkIcon.setAttribute("width", "20");
        bookmarkIcon.setAttribute("width", "20");
        if(bookmark.bmIcon){
            if(bookmark.bmIcon.length){
                console.log(bookmark)
                bookmarkIcon.setAttribute("src", bookmark.bmIcon);
            }

        }else{
            bookmarkIcon.setAttribute("src","./assets/icons/16x16.png" )
        }
       
        bookmarkIcon.setAttribute("alt", "icon of the bookmarked page");

        const bookmarkTitle = document.createElement("a")
        bookmarkTitle.setAttribute("href", bookmark.bmUrl)
        bookmarkTitle.innerText = bookmark.bmTitle;
        bookmarkTitle.setAttribute("target", "_blank")
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
        bookmarkLinkIcon.setAttribute("href", bookmark.bmUrl)
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

        bookmarkCopyLinkIcon.setAttribute("data-url", bookmark.bmUrl)
        bookmarkCopyLinkIcon.addEventListener("click", (e) =>{
            const str = e.target.dataset.url;
            const el = document.createElement('textarea');
            el.value = str;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el)
            displayMessage("Link copied to the clipboard!")
        })

        const bookmarkDeleteIcon = document.createElement("img");
        bookmarkDeleteIcon.setAttribute("data-id", "123")
        bookmarkDeleteIcon.setAttribute("width", "15");
        bookmarkDeleteIcon.setAttribute("height", "15");
        bookmarkDeleteIcon.setAttribute("src", "./assets/001-delete.png");
        bookmarkDeleteIcon.classList.add("icon")
        
        bookmarkDeleteIcon.addEventListener("click", (e)=>{
            let option = confirm("Deleting a Bookmark is non-reversible, press Confirm to delete")
            if(option){
                chrome.runtime.sendMessage({command: "deleteBookmark", data:{
                    bookmark : bookmark
                }}, response =>{
                    if(response.status == "success"){
                        displayMessage(response.message)
                    }else{
                        displayMessage(response.message, "error")
                    }
                })
            }
            
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
        
    }

    });

    container.appendChild(bookmarksList);
    container.style.display = "block";

   
}


async function getPageInfo(callback) {
    chrome.runtime.sendMessage({command: "getPageInfo"}, response =>{
        if(response.status == "success"){
            console.log("Page info has been fetched")
            callback(response.pageInfoData)
        }else{
            displayMessage("Ops, and error has occurred", "error")
        }
    })
}


async function toggleBookmarkOverlay(pageInfo) {

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
            //TODO Add tags suggestion
            const bmTags = bookmarkForm.tags.value;
            if (bmTitle === "" || bmUrl === "") {
                if (!bmTitle) {
                    bookmarkForm.title.classList.add("input-error");
                }
                if (!bmUrl) {
                    bookmarkForm.url.classList.add("input-error");
                }
                displayMessage("Mh, looks like something it's missing", "error")
                return;
            }

            chrome.runtime.sendMessage(
                {
                    command: "addBookmark",
                    bookmark: {
                        bmTitle: bmTitle,
                        bmUrl: bmUrl,
                        bmTags: bmTags,
                        bmIcon: pageInfo[2],
                    },
                },
                (response) => {
                    console.log("Getting updated bookmarks")

                    bookmarkOverlay.style.animation = "dragUp 1s forwards";
                    if(response.status == "success"){
                        displayMessage(response.message)
                    }else{
                        displayMessage(response.message, "error")
                    }
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

//TODO: Check if it already bookmarked and only return a boolean
// Use it also for fast bookmarking via context menu
// At the moment it doesn't update realtime once you've bookmarked your page
function toggleBookmarkButton(){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.storage.local.get(["ubookmarks"], (storage) => {
            if(storage.ubookmarks){
                    storage.ubookmarks.forEach(bookmark => {
                        if(bookmark.bmUrl === tabs[0].url){
                            const bookmarkButton = document.querySelector("#bookmark-btn");
                            bookmarkButton.classList.add("btn-disabled")
                            displayMessage("Oyeah, already bookmarked!", "update")
                            return true;
                        }else{
                        }
                    })
            }
        })
    })
}
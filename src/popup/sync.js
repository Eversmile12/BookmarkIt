let popBookmarkSyncOverlay = function(bookmarksTree){
    console.log("popBookmarkSyncOverlay called, now fetching bookmarks")
    if(bookmarksTree[0].children){
        let data = {};
        let bookmarks = [];
        for(child in bookmarksTree[0].children){            
            bookmarks = logTree(bookmarksTree[0].children[child], bookmarks);
        }
        console.log(bookmarks)
        chrome.storage.local.get(["ubookmarks"], (storage) => {
            data["ubookmarks"] = bookmarks.filter(bookmark => {
                let isNew = true;
                storage.ubookmarks.forEach(storageBookmark => {
                    if(storageBookmark){
                        if(storageBookmark.bmUrl == bookmark.url)
                        isNew = false;
                    }               
                })
                return isNew;
            })

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

function logTree(bookmarksItem, bookmarks){
    if(bookmarksItem.children){
        for(child of bookmarksItem.children){
            bookmarks = logTree(child, bookmarks);
        }
    }if(bookmarksItem.url){
        let bookmark = {};
        bookmark["title"] = bookmarksItem.title;
        bookmark["url"] = decodeURI(bookmarksItem.url);
        bookmarks.push(bookmark);
    }
    return bookmarks;
}

function closeBookmarkSyncOverlay(){
    let bookmarkSyncOverlay = document.querySelector(".bookmark-sync-overlay");
    bookmarkSyncOverlay.style.animation = "dragUp 1s forwards";
    setTimeout (()=>{
        document.querySelector("body").removeChild(bookmarkSyncOverlay);
    },1000)
    
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

function syncBookmarks(){
    let bookmarksToSync = [...document.querySelectorAll(".toSync")];
    bookmarksToSync = bookmarksToSync.filter(bookmarksToSync => {
        return bookmarksToSync.checked
    })
    let bookmarkData = [];
    bookmarksToSync.forEach(bookmark => {
        let bookmarkObj = {
            bmTitle: bookmark.dataset.title,
            bmUrl: bookmark.dataset.url
        }
        
        bookmarkData.push(bookmarkObj)
    })
    
    if(bookmarkData.length > 0){
        console.log("Calling syncUserBookmarks")
        console.log(bookmarkData)
        chrome.runtime.sendMessage(
            {
                command: "syncUserBookmarks",
                data: {
                    bookmarks : bookmarkData
                },
            },
            (response) => {
                let bookmarkSyncOverlay = document.querySelector(".bookmark-sync-overlay");
                bookmarkSyncOverlay.style.animation = "dragUp 1s forwards";
                setTimeout (()=>{
                    document.querySelector("body").removeChild(bookmarkSyncOverlay);
                    displayMessage(response.message)
                },1000)
            }
        );
    }else{
        displayMessage("Start by selecting a couple of bookmarks",3000)
    };
}


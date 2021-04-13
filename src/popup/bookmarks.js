//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged
chrome.storage.onChanged.addListener((changes, namespace) => {
    handleBookmarks(changes, namespace)
})

function handleBookmarks(changes, namespace){
    if(!changes || changes.ubookmarks){
        chrome.storage.local.get(["ubookmarks"], response => {
            if(response){
                if(Object.keys(response.ubookmarks).length){
                    generateBookmarkListItem(response.ubookmarks)
                }else{
                    let container = document.querySelector(".list-container");
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
    
   
}

const generateGroupBtn = () => {
    const createGroupBtn = document.createElement("img")
    createGroupBtn.setAttribute("src", "./assets/add-folder.png");
    createGroupBtn.classList.add("menu-item")

    createGroupBtn.addEventListener("click", () => {
        console.log("Creating group")
        const grpName = prompt("Give it a name!", "NewGroup")
        if(grpName){
            chrome.runtime.sendMessage({command: "createNewGroup", data:{
                grp: grpName //TODO: add possibility to add group name
            }}, response => {
                if(response.status == "success"){
                    displayMessage(response.message, "update")
                }else{
                    displayMessage(response.message, "error")
                }
                
            })
        }
       
    })

    return createGroupBtn;
}

const generateBookmark = (bookmark, bookmarkItem, bmid) => {
    const bookmarkTitle = document.createElement("a")
    bookmarkTitle.setAttribute("href", bookmark.bmUrl)
    bookmarkTitle.innerText = bookmark.bmTitle;
    bookmarkTitle.setAttribute("target", "_blank")
    bookmarkTitle.classList.add("bookmark-title");    

    bookmarkItem.appendChild(bookmarkTitle);
    const bookmarkOptionsContainer = generateBookmarkItemSubMenu(bookmark,bmid)
    bookmarkItem.appendChild(bookmarkOptionsContainer)  

    return bookmarkItem;
    
}

const openSubmenu = (submenu, icon) => {
    if(!submenu.classList.contains("active")){
        closeAllMenus()
    }
    submenu.classList.toggle("active")
    icon.classList.toggle("bookmark-menu-icon-active")
}


const closeAllMenus = () => {
    const menus = document.querySelectorAll(".bookmarks-options-submenu")
    console.log(menus)

    for(const menu in menus){
        if(menus[menu].classList && menus[menu].classList.contains("active")){
            menus[menu].classList.remove("active")
            menus[menu].previousSibling.classList.remove("bookmark-menu-icon-active")
            
        }
    }

}


const generateBookmarkItemSubMenu = (bookmark, bmid) => {
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
        openSubmenu(bookmarkOptionsSubmenu, bookmarkOptionsIcon)
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
                bmid : bmid,
                bgroup: bookmark.group
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

    return bookmarkOptionsContainer;
}

// https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
const toggleSubList = (sublist, referenceNode) => {
    if(sublist && referenceNode){
        const sublistNode = document.querySelectorAll(".submenu-list-container")
        for(const node in sublistNode){
            if(sublistNode[node] && sublistNode[node].parentNode == referenceNode){
                // referenceNode.parentNode.removeChild(referenceNode.nextSibling)
                referenceNode.removeChild(referenceNode.lastChild)
                return;
            }
        }
            referenceNode.appendChild(sublist)
        
        
    }
}

const generateGroup = (group, listItem, groupId) => {
    const groupTitle = document.createElement("p")
    groupTitle.innerText = group.grpTitle;
    groupTitle.classList.add("bookmark-title");

    

    const groupOptionsContainer = document.createElement("div");
    groupOptionsContainer.classList.add("bookmark-options-container")

    const groupOptionsIcon = document.createElement("img")
    groupOptionsIcon.setAttribute("width", "15");
    groupOptionsIcon.setAttribute("height", "15");
    groupOptionsIcon.setAttribute("src", "./assets/menu.png");
    groupOptionsIcon.classList.add("bookmark-menu-icon") 

    const groupOptionsSubmenu = document.createElement("div")
    groupOptionsSubmenu.classList.add("bookmarks-options-submenu")

    groupOptionsIcon.addEventListener("click", () => {
        openSubmenu(groupOptionsSubmenu, groupOptionsIcon)
    })

    const addToGroupIcon = document.createElement("img");
    addToGroupIcon.setAttribute("width", "15");
    addToGroupIcon.setAttribute("height", "15");
    addToGroupIcon.setAttribute("src", "./assets/add.png");
    addToGroupIcon.classList.add("icon","margin-bottom-xsmall")

    addToGroupIcon.addEventListener("click", (e) => {
        chrome.runtime.sendMessage({command: "addBookmarksToGroup",data:{grpId: groupId} }, response => {
            if(response.status  == "success"){
                chrome.storage.local.set({bookmarksSelectionList: {} })
                displayMessage(response.message)
            }
        })
    })   

    const deleteGroupBtn = document.createElement("img");
    deleteGroupBtn.setAttribute("width", "15");
    deleteGroupBtn.setAttribute("height", "15");
    deleteGroupBtn.setAttribute("src", "./assets/001-delete.png");
    deleteGroupBtn.classList.add("icon") 

    deleteGroupBtn.addEventListener("click", () => {
        let option = confirm("Deleting a Group is non-reversible, and will also delete its content")
        if(option){
            chrome.runtime.sendMessage({command: "deleteGroup", data:{grpId: groupId}}, response => {
                if(response.status == "success"){
                    displayMessage(response.message)
                }
            })
        }        
    })

    groupOptionsSubmenu.appendChild(addToGroupIcon)    
    groupOptionsSubmenu.appendChild(deleteGroupBtn)
    groupOptionsContainer.appendChild(groupOptionsIcon)
    groupOptionsContainer.appendChild(groupOptionsSubmenu)

    listItem.appendChild(groupTitle);
    listItem.appendChild(groupOptionsContainer)

    groupTitle.addEventListener("click", () => {
        if(Object.keys(group.children).length > 0){
            const bookmarks = group.children
            toggleSubList(generateBookmarkListItem(bookmarks, true), listItem) 
        }else{
            
        }

    })


    return listItem;
}

//TODO: refactor bookmarks list as a microservice

const createToggleBox = (bookmark, groupId)=> {
    const toggleBox = document.createElement("input")
    toggleBox.setAttribute("type", "checkbox")
    toggleBox.classList.add("bookmark-togglebox")
    toggleBox.setAttribute("data-id", bookmark)
    if(groupId){
       toggleBox.setAttribute("data-grpId", groupId)
    }else{
        toggleBox.setAttribute("data-grpId", "")
    }

    toggleBox.addEventListener("change", addBookmarkToSelectionList)
    
    return toggleBox;
}

const addBookmarkToSelectionList = (e) => {
    if(e.srcElement.checked){
        chrome.runtime.sendMessage({command: "addBookmarkToSelectionListStorage", data:{bmId: e.srcElement.dataset["id"], groupId: e.srcElement.dataset["grpid"]}}, response => {
        })
        e.srcElement.previousSibling.classList.add("hidden")
        e.srcElement.classList.add("active")
    }else{
        chrome.runtime.sendMessage({command: "removeBookmarkToSelectionListStorage", data:{bmId: e.srcElement.dataset["id"]}}, response => {
        })
        e.srcElement.previousSibling.classList.remove("hidden")
        e.srcElement.classList.remove("active")
    }
}

const setIconItem = (icon, isGroup = false) => {
    const iconContainer = document.createElement("div")
    iconContainer.classList.add("icon-container")
    const iconItem = document.createElement("img");
    iconItem.classList.add("bookmark-icon");
    iconItem.setAttribute("width", "20");
    iconItem.setAttribute("width", "20");
    iconItem.setAttribute("alt", "icon of the bookmarked page");
    //TODO: refactor code.
    if(icon){
        iconItem.setAttribute("src", icon)
        iconItem.classList.add("interactive")
    }else if(isGroup){
        iconItem.setAttribute("src", "./assets/folder.png")
    }else{
        iconItem.setAttribute("src", "./assets/icons/16x16.png")
        iconItem.classList.add("interactive")
    }
    
    iconContainer.appendChild(iconItem)
    return iconContainer
}



const generateBookmarkListItem = (bookmarks, submenu = false) => {

    let elementsList = document.createElement("ul");


    if(submenu){
        elementsList.classList.add("group-bookmark-sublist");
    }else{
        elementsList.classList.add("bookmark-list");
    }
    
    
    const createGroupBtn = generateGroupBtn()
    
    

    for(const item in bookmarks){
        
        const itemTemp = bookmarks[item]
        if(itemTemp){                    
            let listItem = document.createElement("LI");
            listItem.classList.add("list-item");

        

            let itemIcon;
            if(itemTemp.children){
                listItem = generateGroup(itemTemp, listItem, item)
                itemIcon = setIconItem(null, true)
            }else{ 
                if(itemTemp.bmIcon){
                    if(itemTemp.bmIcon.length){
                        itemIcon = setIconItem(itemTemp.bmIcon)
                    }               
                }else{
                    itemIcon = setIconItem()
                }
                const toggleBox = createToggleBox(item, itemTemp.group)
                itemIcon.appendChild(toggleBox) 
                listItem = generateBookmark(itemTemp, listItem, item)      
            }

            listItem.appendChild(itemIcon);

            elementsList.appendChild(listItem);
            }
        }
    let listContainer 
    if(submenu){
        listContainer = document.createElement("div")
        listContainer.classList.add("submenu-list-container")
        listContainer.appendChild(elementsList);
        return listContainer
    }else{
        listContainer = document.querySelector(".list-container")
        listContainer.innerHTML = "";
        listContainer.appendChild(createGroupBtn)
        listContainer.appendChild(elementsList);
        listContainer.style.display = "block";
    }   

    


};







async function getPageInfo(callback) {
    chrome.runtime.sendMessage({command: "getPageInfo"}, response =>{
        if(response.status == "success"){
            callback(response.pageInfoData)
            return response.pageInfoData
        }else{
            displayMessage("Ops, and error has occurred", "error")
            return null;
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
                    for(bookmark in storage.ubookmarks) {
                        if(storage.ubookmarks[bookmark].bmUrl === tabs[0].url){
                            const bookmarkButton = document.querySelector("#bookmark-btn");
                            bookmarkButton.classList.add("btn-disabled")
                            displayMessage("Oyeah, already bookmarked!", "update")
                            return true;
                        }else{
                        }
                    }
            }
        })
    })
}
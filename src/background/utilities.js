




chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if(message.command == "getPageInfo"){
        console.log("Get page info has been called")
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            let pageInfo = []
            let tabTitle = tabs[0].title.substring(0, 40);
            let tabUrl = tabs[0].url;
            let favIcon = tabs[0].favIconUrl;
            pageInfo.push(tabTitle);
            pageInfo.push(tabUrl);
            pageInfo.push(favIcon);
            callback({
                status: "success",
                pageInfoData: pageInfo
            })  
        })        
    }
})

//TODO  
  
let contextMenuFastSave = function(){
    console.log("Menu fast save clicked")
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        let pageInfo = []
        let bmTitle = tabs[0].title.substring(0, 40);
        let bmUrl = tabs[0].url;
        let bmIcon = tabs[0].favIconUrl;
        const addBookmark = firebase.functions().httpsCallable("addBookmarkToUser")
        const bookmark = {
            bmTitle: bmTitle,
            bmUrl: bmUrl,
            bmTags: "",
            bmIcon: bmIcon,
        }
        chrome.storage.local.get(["uuid"], storage => {
            addBookmark({bookmark : bookmark, uuid:storage.uuid}).then(response =>{                    
                    updateBookmarksOnLocalStorage(storage.uuid)
                    chrome.browserAction.setBadgeText({text: "New"})
                }
            );  
        })
    })       
} 

chrome.contextMenus.create({
    "title":"Bookmark It!",
    "contexts": ["page", "selection", "image", "link"],
    "onclick" : contextMenuFastSave
})


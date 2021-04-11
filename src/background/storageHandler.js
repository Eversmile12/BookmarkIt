function updateUserOnLocalStorage(user){
    console.log("updateUserOnLocalStore called")
    chrome.storage.local.set({uuid: user.uid})
    chrome.storage.local.set({user: user.email})
}

async function updateBookmarksOnLocalStorage(uuid){
    console.log("updateBookmarksOnLocalStore called for: " + uuid )
    const getUserBookmarks = firebase.functions().httpsCallable("getUserBookmarks")
    getUserBookmarks({uuid: uuid})
    .then( result =>  {
        if(result.data){
            console.log(result.data)
            chrome.storage.local.set({ubookmarks : result.data})
        }else{
            chrome.storage.local.set({ubookmarks : []})
        }
        console.log("bookmarks updated, now firing callback")
    })
    return true;
}


chrome.runtime.onMessage.addListener((message, sender, callback)=> {
    if(message.command == "addBookmarkToSelectionListStorage"){
        console.log("addbookmarktoselectionlist: called on " + message.data.bmId)

        chrome.storage.local.get(["ubookmarks"], savedBookmarks => {

            chrome.storage.local.get(["bookmarksSelectionList"], (storage) => {
                console.log(storage.bookmarksSelectionList)

                let bookmarksSelectionList = {};
                let bookmarkTodAdd;

                if(storage.bookmarksSelectionList){
                    bookmarksSelectionList = storage.bookmarksSelectionList
                    console.log(message.data.groupId.length)
                }
                
                if(message.data.groupId){
                    bookmarkTodAdd = savedBookmarks.ubookmarks[message.data.groupId].children[message.data.bmId]
                }else{
                    bookmarkTodAdd = savedBookmarks.ubookmarks[message.data.bmId]
                }
                bookmarksSelectionList[message.data.bmId] = bookmarkTodAdd
                chrome.storage.local.set({bookmarksSelectionList: bookmarksSelectionList })
                callback()
            })
            return true
        })
       
    }else if(message.command == "removeBookmarkToSelectionListStorage"){
        console.log("removeBookmarkToSelectionListStorage: called")
        chrome.storage.local.get(["bookmarksSelectionList"], (storage) => {
            let bookmarksSelectionList = storage.bookmarksSelectionList
            delete bookmarksSelectionList[message.data.bmId]
            chrome.storage.local.set({bookmarksSelectionList: bookmarksSelectionList })
            callback()
        })
        return true
    }
})






// function deleteUserFromLocal(){
//     console.log("deleteUserFromLocal called")
// }







// function setUserInfo(credentials){
//     chrome.storage.local.set({uuid: credentials.user.uid});
//     chrome.storage.local.set({uemail: credentials.user.email});
//     chrome.storage.local.get(["uuid"], response => {
//         console.log(response.uuid)
//     })
//     let bookmarksuuid = credentials.user.uid + "-bookmarks";
//     // chrome.storage.local.get([bookmarksuuid], response => {

//     // })
// }



// //TODO: at the moment is not a tree but is planned to become
// function getUserBookmarksTree()
//   // We need to store:
//   
//     Bookmarks refreshed when updated

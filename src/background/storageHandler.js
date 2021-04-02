function updateUserOnLocalStorage(user){
    console.log("updateUserOnLocalStore called")
    chrome.storage.local.set({uuid: user.uid})
    chrome.storage.local.set({user: user.email})
}

async function updateBookmarksOnLocalStorage(uuid){
    console.log("updateBookmarksOnLocalStore called for:" + uuid )
    const getUserBookmarks = firebase.functions().httpsCallable("getUserBookmarks")
    getUserBookmarks({uuid: uuid})
    .then( result =>  {
        if(result.data){
            chrome.storage.local.set({ubookmarks : result.data})
        }else{
            chrome.storage.local.set({ubookmarks : []})
        }
        console.log("bookmarks updated, now firing callback")
    })
    return true;
}


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

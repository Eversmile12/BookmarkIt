
chrome.runtime.onMessage.addListener((message,sender,callback) =>{
    if(message.command == "addBookmark"){
      console.log("addBookmarkToUser called")
      const addBookmark = firebase.functions().httpsCallable("addBookmarkToUser")
      chrome.storage.local.get(["uuid"], storage => {
        if(storage){
          addBookmark({bookmark : message.bookmark, uuid:storage.uuid})
          .then( response => {
            console.log("Bookmark added now updating local storage")
            updateBookmarksOnLocalStorage(storage.uuid)
            .then(response => {
              callback({
                status: "success",
                message: "A bookmark is for ever!"
              })
            }).catch(e => {
              console.log("Error adding bookmark: ")
              console.log(e)
              callback({
                status: "failed",
                message: "Something occured! Try again"
              })          
            })   
          })
        }else{
          //TODO SORT THIS EVENTUALITY 
        }
      })    
    }
  })

  chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if(message.command == "deleteBookmark"){
      const deleteBookmark = firebase.functions().httpsCallable("removeBookmarkFromUser")
      chrome.storage.local.get(["uuid"], storage => {
        if(storage){
          console.log(message.data.bookmark)
          deleteBookmark({bookmark: message.data.bookmark, uuid : storage.uuid})
          .then(response => {
            updateBookmarksOnLocalStorage(storage.uuid).
            then(response =>{
              callback({
                message: "We got rid of it!",
                status: "success"
              })
            }).catch(e => {
              console.log("Error deleting bookmark: ")
              console.log(e)
              callback({
                message: "We got rid of it!",
                status: "success"
              })
            })
          })
        }
      })
    }
  })

  
//TODO: REVIEW BOOKMARKS SYNCH

chrome.runtime.onMessage.addListener((message,sender,callback) =>{
  if(message.command == "syncUserBookmarks"){
    console.log("syncUserBookmarks called now sending bookmarks: ")
    console.log(message.data.bookmarks)
    const addBookmarksArrayToUser = firebase.functions().httpsCallable("addBookmarksArrayToUser")
    chrome.storage.local.get(["uuid"], storage => {
      if(storage){
        addBookmarksArrayToUser({bookmarks : message.data.bookmarks, uuid: storage.uuid})
        .then( response => {
          updateBookmarksOnLocalStorage(storage.uuid)
        })      
          .then( response => {
            callback({
              status: "success",
              message: "Yes, you saved them"
            })
          })
      }
    })
  }
  return true;
})
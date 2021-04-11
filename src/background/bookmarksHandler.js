chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if (message.command == "addBookmark") {
        console.log("addBookmarkToUser called");
        const addBookmark = firebase
            .functions()
            .httpsCallable("addBookmarkToUser");
        chrome.storage.local.get(["uuid"], (storage) => {
            if (storage) {
                addBookmark({
                    bookmark: message.bookmark,
                    uuid: storage.uuid,
                }).then((response) => {
                    console.log("Bookmark added now updating local storage");
                    updateBookmarksOnLocalStorage(storage.uuid)
                        .then((response) => {
                            callback({
                                status: "success",
                                message: "A bookmark is for ever!",
                            });
                        })
                        .catch((e) => {
                            console.log("Error adding bookmark: ");
                            console.log(e);
                            callback({
                                status: "failed",
                                message: "Error deleting bookmark: " + e,
                            });
                        });
                });
            } else {
                //TODO SORT THIS EVENTUALITY
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if (message.command == "deleteBookmark") {
        const deleteBookmark = firebase
            .functions()
            .httpsCallable("removeBookmarkFromUser");
        chrome.storage.local.get(["uuid"], (storage) => {
            if (storage) {
              console.log(message.data.bgroup)
              if(message.data.bgroup){
                if(message.data.bgroup.length > 0){
                  console.log(message.data.bmid)
                  console.log(message.data.bgroup)
                  console.log(storage.uuid)
                  deleteBookmark({
                    bmuid: message.data.bmid,
                    groupId: message.data.bgroup,
                    uuid: storage.uuid
                  }).then(response => {
                    updateBookmarksOnLocalStorage(storage.uuid)
                    callback({
                        status: "success",
                        message: "We got rid of it!"
                    })
                  })
                }
              }else{
                  deleteBookmark({
                    bmuid: message.data.bmid,
                    uuid: storage.uuid,
                  }).then((response) => {
                      updateBookmarksOnLocalStorage(storage.uuid);
                      callback({
                        status: "success",
                        message: "We got rid of it!"
                    })
                  });
              }          
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if (message.command == "createNewGroup") {
        const createNewGroup = firebase
            .functions()
            .httpsCallable("createUserBookmarkGroup");
        chrome.storage.local.get(["uuid"], (storage) => {
            if (storage.uuid) {
                createNewGroup({ grp: message.data.grp, uuid: storage.uuid })
                    .then((response) => {
                        updateBookmarksOnLocalStorage(storage.uuid);
                        callback({
                            message: "Well done, keep it tidy!",
                            status: "success",
                        });
                    })
                    .catch((e) => {
                        console.log("Error creating group ");
                        console.log(e);
                        callback({
                            message: "Error creating group: " + e,
                            status: "failed",
                        });
                    });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message,sender,callback) => {
    if(message.command == "deleteGroup"){
        console.log("delete group called on group: ")
        console.log(message.data.groupId)
        chrome.storage.local.get(["uuid"], storage => {
            const deleteGroup = firebase.functions().httpsCallable("removeGroupFromUser")
            if(storage.uuid){
                deleteGroup({uuid: storage.uuid, groupId : message.data.grpId})
                .then(response => {
                    updateBookmarksOnLocalStorage(storage.uuid)
                    callback({
                        message: "Group has been deleted",
                        status: "success"
                    })

                })
            }
        })
    }
})

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if (message.command == "addBookmarksToGroup") {
        console.log("addbookmarkstogroup called");

        chrome.storage.local.get(["uuid"], (uuid) => {
            chrome.storage.local.get(["bookmarksSelectionList"], (storage) => {
                console.log(storage);

                if (
                    storage &&
                    storage.bookmarksSelectionList &&
                    Object.keys(storage.bookmarksSelectionList).length > 0
                ) {
                    const addBookmarksToGroup = firebase.functions().httpsCallable("addBookmarkIntoGroup");

                    if(Object.keys(storage.bookmarksSelectionList).length > 0){
                        addBookmarksToGroup({
                            grpId: message.data.grpId,
                            bookmarksList: storage.bookmarksSelectionList,
                            uuid: uuid.uuid,
                        }).then((response) => {
                                console.log(response)
                                updateBookmarksOnLocalStorage(uuid.uuid);
                                callback({
                                    message: "Bookmark grouped!",
                                    status: "success",
                                });
                            })
                            .catch((e) => {
                                callback({
                                    message: "Error, adding bookmark",
                                    status: "failed",
                                });
                            });
                    }
                }else{
                    callback({
                                message: "Select a bookmark first!",
                                status: "success",
                            });
                }
            });
        });

        return true;
    }
});

//TODO: REVIEW BOOKMARKS SYNC

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if (message.command == "syncUserBookmarks") {
        console.log("syncUserBookmarks called now sending bookmarks: ");
        console.log(message.data.bookmarks);
        const addBookmarksArrayToUser = firebase
            .functions()
            .httpsCallable("addBookmarksArrayToUser");
        chrome.storage.local.get(["uuid"], (storage) => {
            if (storage) {
                addBookmarksArrayToUser({
                    bookmarks: message.data.bookmarks,
                    uuid: storage.uuid,
                })
                    .then((response) => {
                        updateBookmarksOnLocalStorage(storage.uuid);
                    })
                    .then((response) => {
                        callback({
                            status: "success",
                            message: "Yes, you saved them",
                        });
                    });
            }
        });
    }
    return true;
});
/*
user:{
  bookmarks:[
    0:
    bmIcon:
    bmTags:
    ...
    bmUrl:
  ]
  email: a@a.com
}

user:{
  bookmarks{
    
  }
}


*/



  let contextMenuFastSave = () => {
    // irebase.firestore().collection("bookmarks").add({
    //   bm_tags: message.data.tags,
    //   bm_title: message.data.title,
    //   bm_url: message.data.url.replaceAll("\"",""),
    //   bm_icon: message.data.favIcon,
    //   bm_user_uid: userId
    // })
  } 

  chrome.contextMenus.create({
    "title":"Bookmark It!",
    "contexts": ["page", "selection", "image", "link"],
    "onclick" : contextMenuFastSave
})



firebase.functions()
 
  
  chrome.runtime.onMessage.addListener((message,sender, callback) => {
    if(message.command == "SignUpUser"){
      firebase.auth().createUserWithEmailAndPassword(message.data.email, message.data.password)
      .then(credentials => {
        chrome.storage.local.set({user: credentials.user.email}, ()=>{
        })
        callback({
          status : "success",
          message: "user registered"
        })
      }).catch(e => {
        callback({
          status: "failed",
          message: e.message,
        })
    })      
      
    // }else if(message.command == "LoginUser"){
    //   firebase.auth().signInWithEmailAndPassword(message.data.email, message.data.password)
    //   .then(credentials => {
    //     chrome.storage.local.set({user: credentials.user.email}, ()=>{
    //     })
        
    //     callback({ 
    //       status: "success",
    //       message: "user logged in",
    //     })
    //   }).catch(e => {

    //     callback({
    //       status: "failed",
    //       message: "User not found"
    //     })
    // })
    } else if(message.command == "SignOutUser"){
      firebase.auth().signOut()
      .then(() => {
        callback({
          status: "success",
          message: "user logged out"
        })
      })
    }
    return true;
})



chrome.runtime.onMessage.addListener((message,sender,callback) =>{
  if(message.command == "addBookmark"){
    let userId = getUID();
    firebase.firestore().collection("bookmarks").add(({
      bm_tags: message.data.tags,
      bm_title: message.data.title,
      bm_url: message.data.url.replaceAll("\"",""),
      bm_icon: message.data.favIcon,
      bm_user_uid: userId
    }))
    callback({
      status: "success",
      message: "bookmark added successfully"
    })
  }else if( message.command == "fetchUserBookmarks"){
    chrome.storage.local.remove("bookmarks");
    firebase.firestore().collection("bookmarks").where("bm_user_uid", "==", message.data.uid).get()
    .then((snapshot) => {
      let docs = []
      snapshot.docs.forEach(doc =>{
        let docData = {
          doc_data: doc.data(),
          doc_id: doc.id,
        }
        docs.push(docData)
        chrome.storage.local.set({bookmarks: docs}, ()=>{
        })
    })
      callback({
        content: docs
      })
    })
  }else if(message.command == "deleteBookmark"){
    firebase.firestore().collection("bookmarks").doc(message.data.docId).delete()
    .then(
      setTimeout(() => { callback(); }, 300)
    );
  }

  return true;
})


chrome.runtime.onMessage.addListener((message,sender,callback) =>{
  if(message.command == "synchUserBookmarks"){
    let userId = getUID();
    const bookmarksRef = firebase.firestore().collection("bookmarks");
    message.data.bookmarksData.forEach(bookmark => {
      bookmarksRef.add({
        bm_tags: "",
        bm_title: bookmark.title,
        bm_url: bookmark.url.replaceAll("\"",""),
        bm_icon: "",
        bm_user_uid: userId
      })
    })
    callback();
  }
  return true;
})
  

function getUID(){
  let uid = firebase.auth().currentUser.uid
  return uid;
}

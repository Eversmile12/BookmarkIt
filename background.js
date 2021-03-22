var firebaseConfig = {
  apiKey: "AIzaSyBz6HqJAKkPE0K9May5cdw9sFBW2K7i5f0",
  authDomain: "bookmarkit-26f28.firebaseapp.com",
  databaseURL: "https://bookmarkit-26f28-default-rtdb.firebaseio.com",
  projectId: "bookmarkit-26f28",
  storageBucket: "bookmarkit-26f28.appspot.com",
  messagingSenderId: "92066820035",
  appId: "1:92066820035:web:4fc99df169ba26a9d89776"
}
  firebase.initializeApp(firebaseConfig);


  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      chrome.runtime.sendMessage({command: "userLoggedIn", user: user}, response => {
        // user handler fired
      })
    }else{
      chrome.runtime.sendMessage({command: "userLoggedOut"}, response => {
        // user handler fired
      })
    }
  })
  
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
      
    }else if(message.command == "LoginUser"){
      firebase.auth().signInWithEmailAndPassword(message.data.email, message.data.password)
      .then(credentials => {
        chrome.storage.local.set({user: credentials.user.email}, ()=>{
        })
        
        callback({ 
          status: "success",
          message: "user logged in",
        })
      }).catch(e => {

        callback({
          status: "failed",
          message: "User not found"
        })
    })
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

chrome.runtime.onMessage.addListener((message, sender, callback) => {
  if(message.command == "checkUser"){
    let retrievedUser = firebase.auth().currentUser;
    callback({
      user: retrievedUser
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
          console.log("bookmarks have been saved")
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
    console.log(message.data.bookmarksData)
    message.data.bookmarksData.forEach(bookmark => {
      console.log(bookmark.title)
      bookmarksRef.add({
        bm_tags: "",
        bm_title: bookmark.title,
        bm_url: bookmark.url.replaceAll("\"",""),
        bm_icon: "",
        bm_user_uid: userId
      })
    })
  }
})
  

function getUID(){
  let uid = firebase.auth().currentUser.uid
  return uid;
}

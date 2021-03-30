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




chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if(message.command == "checkUser"){
      let user = firebase.auth().currentUser;
      if(user){
        callback({
            message: "Welcome back",
            status: "success",
            user: user
        })
      }else{
        callback({
            message: "It's a beautiful day isn't it?",
            status: "not found"
        })
    }
    }
    
    return true;
  })


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
  
chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if(message.command == "LoginUser"){
        firebase.auth().signInWithEmailAndPassword(message.data.email, message.data.password)
    .then(credentials => {
            console.log(credentials)
        chrome.storage.local.set({user: credentials.user.email})
        chrome.storage.local.set({user: credentials.user.email})
        setUserInfo(credentials)
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
}
})


function setUserInfo(credentials){
    chrome.storage.local.set({uuid: credentials.user.uid});
    chrome.storage.local.set({uemail: credentials.user.email});
    chrome.storage.local.get(["uuid"], response => {
        console.log(response.uuid)
    })
    let bookmarksuuid = credentials.user.uid + "-bookmarks";
    // chrome.storage.local.get([bookmarksuuid], response => {

    // })
}



// //TODO: at the moment is not a tree but is planned to become
// function getUserBookmarksTree()
//   // We need to store:
//   
//     Bookmarks refreshed when updated

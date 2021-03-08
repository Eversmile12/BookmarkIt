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

  const db = firebase.firestore();


  firebase.auth().onAuthStateChanged(user => {
    if(user) {
      chrome.runtime.sendMessage({command: "userLoggedIn", user: user}, response => {
      })
    }else{
      chrome.runtime.sendMessage({command: "userLoggedOut"}, response => {

      })
    }
  })
  
  chrome.runtime.onMessage.addListener((message,sender, callback) => {
    if(message.command == "SignUpUser"){
      firebase.auth().createUserWithEmailAndPassword(message.data.email, message.data.password)
      .then(credentials => {
        console.log(credentials)
        callback({
          status : "success",
          message: "user registered"
        })
      }).catch(e => {
        console.log("error: " + e)
        callback({
          status: "failed",
          message: e.message,
        })
    })      
      
    }else if(message.command == "LoginUser"){
      firebase.auth().signInWithEmailAndPassword(message.data.email, message.data.password)
      .then(credentials => {
        callback({
          status: "success",
          message: "user logged in"
        })
      }).catch(e => {
        console.log(e.message);
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
  let retrievedUser = firebase.auth().currentUser;
  callback({
    user: retrievedUser
  })
})

    

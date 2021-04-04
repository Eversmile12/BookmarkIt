
// chrome.storage.local.get(function(result){console.log(result)}) 

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if(message.command == "checkUserLoginStatus"){
      let user = firebase.auth().currentUser;
      if(user){
        callback({
            message: "Welcome back " + user.email,
            status: true
        })
      }else{
        callback({
            status: false
        })
    }
    }
    
    return true;
  })


firebase.auth().onAuthStateChanged(user => {
    if(user) {
        console.log("logging user ");
        updateUserOnLocalStorage(user);
        updateBookmarksOnLocalStorage(user.uid)           
    }else{
        deleteUserFromLocal()
    }
})
    
    
    

chrome.runtime.onMessage.addListener((message, sender, callback) => {
    if(message.command == "LoginUser"){
        firebase.auth().signInWithEmailAndPassword(message.data.email, message.data.password)
        .then(ucredentials => {
            callback({ 
                status: "success",
                message: "Welcome back " + ucredentials.email,
            })
        }).catch(e => {
            console.log(e)
            callback({
                status: "failed",
                message: e.message
            })
        })
    }
})


chrome.runtime.onMessage.addListener((message,sender, callback) => {
    if(message.command == "SignUpUser"){
      firebase.auth().createUserWithEmailAndPassword(message.data.email, message.data.password)
      .then(credentials => {
        callback({
          status : "success",
          message: "You're now a bookmarker!"
        })
      }).catch(e => {
        callback({
          status: "failed",
          message: e.message,
        })
    })} else if(message.command == "SignOutUser"){
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
  if(message.command == "ResetUserPassword"){
    const userEmail = message.data.email
    //TODO: add check if mail is valid
    firebase.auth().sendPasswordResetEmail(userEmail)
    .then((response) => {
      callback({
        status: "success",
        message: "Email sent! Check your inbox!",
        response: response
      })
    }).catch(e => {
      callback({
        status: "failed",
        message: "User not found",
        response: e
      })
      console.log(e);
    })
  }
})
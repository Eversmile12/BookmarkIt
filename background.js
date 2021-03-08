var firebaseConfig = {
    apiKey: "AIzaSyC8s3-L2FXYNvWIiXDY6GFxvRmSmzMkd2Y",
    authDomain: "coupons-project-484c5.firebaseapp.com",
    projectId: "coupons-project-484c5",
    databaseURL: "https://coupons-project-484c5-default-rtdb.firebaseio.com",
    storageBucket: "coupons-project-484c5.appspot.com",
    messagingSenderId: "887250421341",
    appId: "1:887250421341:web:a430e6fc7e30ca1edbafb4"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


  chrome.runtime.onMessage.addListener((message,sender, callback) => {
    generateDetailWindow();
    callback({
      message: "success"
    })
})

  chrome.runtime.onMessage.addListener(
    function(message, callback) {
      
      if (message == "changeColor"){
        chrome.tabs.executeScript({
          code: 'document.body.style.backgroundColor="orange"'
        });
      }
      return true
    });

    
function generateDetailWindow(tabUrl, tabTitle, tabFavicon){
   chrome.tabs.executeScript({
        file: 'bookmark.js'
      });
}

window.onload = () =>{
    chrome.runtime.sendMessage({command: "checkUser"}, response =>{
        uiHandler(response.user)
    })
}


function uiHandler(user){
    if(user){
        generateForm("actions.mustache", "loggedIn");
    }else{
        generateForm("login-form.mustache", "login")
        
    }
}

function generateForm(template, status){
    fetch("./views/"+template)
    .then((response) => response.text())
    .then((template) => {
        var render = Mustache.render(template, {synched: false});
        document.querySelector(".actions-container").innerHTML = render;
        if(status == "login"){
        
            document.querySelector("#signup-redirect").addEventListener("click", () => {
                generateForm("signup-form.mustache", "signUp")
            })

            const loginForm = document.querySelector("#login-form");
            // Add event listener to login form
            loginForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const email = loginForm["login-email"].value;
                const password = loginForm["login-password"].value;

                //Login user
                chrome.runtime.sendMessage({command: "LoginUser", data:{email: email, password: password}}, response => {
                    if(response.status == "failed"){
                       displayError(response.message,1)
                    }
                })
            })
        }else if(status == "signUp"){
            document.querySelector("#signin-redirect").addEventListener("click", () => {
                generateForm("login-form.mustache", "login")
            })


            const signupForm = document.querySelector("#signup-form");
            signupForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const email = signupForm["signup-email"].value;
                const password = signupForm["signup-password"].value;

                chrome.runtime.sendMessage({command: "SignUpUser", data:{email: email, password: password}}, response => {
                    if(response.status == "failed"){
                      displayError(response.message,1)
                    }
                })
            })
        }else if(status == "loggedIn"){
            setLoggedInListeners();
        }
    })
}






chrome.runtime.onMessage.addListener((message, sender, callback) => {
    uiHandler(message.user)
    callback({
        message: "user handler fired",
    });
    
})

function setLoggedInListeners(){
    const logoutButton = document.querySelector("#logout-btn");
    const bookmarkButton = document.querySelector("#bookmark-btn");
    const closeBookmarkButton = document.querySelector("#close-bookmark-button");
    const syncButton = document.querySelector("#sync-btn");
    

    logoutButton.addEventListener("click", ()=>{
        chrome.runtime.sendMessage({command: "SignOutUser"}, response => {
            console.log(response.status)
        })
    })
    

    bookmarkButton.addEventListener("click", () =>{
        popBookmarkOverlay()
    })

    closeBookmarkButton.addEventListener("click", () => {
        toggleBookmarkOverlay()
    })

    syncButton.addEventListener("click", () => {

    })

    
}



function popBookmarkOverlay(){
    chrome.tabs.query({active: true, currentWindow: true}, tabs =>{
        console.log(tabs[0])
        let tabTitle = tabs[0].title
        let tabUrl = tabs[0].url
        let pageInfo = [];
        pageInfo.push(tabTitle)
        pageInfo.push(tabUrl)
        toggleBookmarkOverlay(pageInfo)
    })
}

function displayError(error, type, color){
    let formContainer = document.querySelector(".form-container");
    if(document.querySelector("#error-message")){
        formContainer.removeChild(document.querySelector("#error-message"))
    }
    let form = document.querySelector("form");
    const errorMessage = document.createElement("P");
    errorMessage.id = "error-message";
    switch(type){
        case 1:
            errorMessage.innerText = "🔴 " 
            break;
        case 2:
            errorMessage.innerText = "⚡"
            break;
        case 3:
            errorMessage.innerText = "🤔";
    }
    if(color != ""){
        errorMessage.classList.add(color);

    }
    errorMessage.innerText += error;
    form.parentNode.insertBefore(errorMessage, form.nextSibling)
}


function toggleBookmarkOverlay(pageInfo){
    const bookmarkOverlay = document.querySelector(".bookmark-container-overlay");
    const bookmarkForm = document.querySelector("#details-form")

    let bookmarkOverlayDisplay = bookmarkOverlay.style.display;

    if(bookmarkOverlayDisplay == "none"){
        let detailsInput = document.getElementsByClassName("page-detail");
        for(let i = 0; i <= 1; i++){
            detailsInput[i].value = pageInfo[i];
        }
        bookmarkForm.addEventListener("submit", (e)=>{
            e.preventDefault();
            bookmarkForm.title.classList.remove("input-error")
            bookmarkForm.url.classList.remove("input-error")
            bookmarkForm.tags.classList.remove("input-error")

            const bmTitle = bookmarkForm.title.value;
            const bmUrl = bookmarkForm.url.value;
            const bmTags = bookmarkForm.tags.value;           
            if(bmTitle === "" || bmUrl === "" || bmTags === ""){
                if(!bmTitle){
                    console.log("tags are missing man");
                    bookmarkForm.title.classList.add("input-error")
                }if(!bmUrl){
                    bookmarkForm.url.classList.add("input-error")
                }if(!bmTags){
                    bookmarkForm.tags.classList.add("input-error")
                }
                displayError("Mh, looks like something it's missing",3, "text-light")
                return;
            }
            const bmFavIcon = pageInfo[2];
            chrome.runtime.sendMessage({command:"add boomark", data:{title: bmTitle, url:bmUrl, tags:bmTags, favIcon:bmFavIcon}}, response =>{
                
            })
           
        })
        bookmarkOverlay.style.display = "block";

    }else{
        bookmarkOverlay.style.display = "none";
    }
}



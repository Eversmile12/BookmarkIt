window.onload = () => {
    chrome.runtime.sendMessage({ command: "checkUserLoginStatus" }, (isLoggedIn) => {
        console.log(isLoggedIn)
        uiHandler(isLoggedIn.status)
    });
};

function uiHandler(isLoggedIn) {
    if (isLoggedIn) {
        console.log("generateLoggedInUI called")
        generateLoggedInUI();
    } else {
        generateLoginUI();
    }
}


function generateLoginUI(){
    fetch("./views/login-form.mustache")
    .then(response=>response.text())
    .then(template => {
        //TODO: change user name
        let username;
        chrome.storage.local.get("user", (response) =>{
            if(response.user){
                console.log(response.user)
                username = response.user;
            }else{
                username = "User";
            }
            var render = Mustache.render(template, {name:username});
            document.querySelector(".actions-container").innerHTML = render;
            renderAvatar();
            document.querySelector("#signup-redirect").addEventListener("click", () => {
                generateSignUpUI()
            });

            let avatarSelectionButton = document.querySelector(".select-avatar-button");
            let avatarSelectionSubMenu = document.querySelector(".avatar-gender-submenu");
            let submenuIcon = document.querySelector(".dropdown-icon");
            //Add event listener to gender submenu
            avatarSelectionButton.addEventListener("click", e=>{
                avatarSelectionSubMenu.classList.toggle("avatar-gender-submenu-active");
                submenuIcon.classList.toggle("active-submenu");
            })
            const avatarGenderOption = [...document.querySelectorAll(".avatar-gender-option")];
            avatarGenderOption.forEach(genderOption => {
                genderOption.addEventListener("click", (e) => {
                    chrome.storage.local.set({userGender: e.target.innerText}, ()=>{
                        renderAvatar();
                    })
            })
            })
            
            const loginForm = document.querySelector("#login-form");
            // Add event listener to login form
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = loginForm["login-email"].value;
                const password = loginForm["login-password"].value;
                if(email.length > 0 && password.length > 0){
                    chrome.runtime.sendMessage(
                        {
                            command: "LoginUser",
                            data: { email: email, password: password },
                        },
                        (response) => {
                            if (response.status == "failed") {
                                const loginForm = document.querySelector(".login-form__text-box")
                                displayMessage("Your email or password are not correct", "error");
                                const recoveryBtn = document.querySelector(".recovery-btn")
                                if(recoveryBtn){
                                    loginForm.removeChild(recoveryBtn)
                                }
                                
                                let passwordRecoveryButton = document.createElement("a")
                                passwordRecoveryButton.addEventListener("click", () => {
                                    togglePasswordRecoveryOverlay();
                                })
                                passwordRecoveryButton.classList.add("btn-text", "margin-left-small", "recovery-btn")
                                passwordRecoveryButton.innerText= "Forgot your password?"
                                loginForm.appendChild(passwordRecoveryButton)
                            }else{
                                window.location.reload()
                            }
                        }
                    );
                    
                }else{
                    //TODO: refactor using dom object thing
                    displayMessage("Hey, Something is missing", "error")
                    if(!email.length > 0){
                        loginForm["login-email"].classList.add("input-error")
                    }else if(!password.length > 0){
                        loginForm["login-password"].classList.add("input-error")
                    }
                }
                //Login user
                
            });
        })
        
    })
}
function renderAvatar(){
    chrome.storage.local.get(["userGender"], response => {
        let profileImage = document.querySelector(".login-form-image");
        let image;
            switch(response.userGender){
                case "Male":
                    image = "assets/male_profile_image.svg"
                    break;
                case "Female":
                    image = "assets/female_profile_image.svg"
                    break;
                case "Other":
                    image = "assets/unicorn_profile_image.svg"
                    break;
                default:
                    image ="assets/male_profile_image.svg"
                    break;
            }
            profileImage.setAttribute("src", image);
    })
}

function generateSignUpUI(){

    fetch("./views/signup-form.mustache")
    .then(response=>response.text())
    .then(template => {
        var render = Mustache.render(template);
        document.querySelector(".actions-container").innerHTML = render;
        document.querySelector("#signin-redirect").addEventListener("click", () => {
            generateLoginUI()
        });
        const signupForm = document.querySelector("#signup-form");
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = signupForm["signup-email"].value;
            const password = signupForm["signup-password"].value;
            if(email.length > 0 && password.length > 0){
                chrome.runtime.sendMessage(
                    {
                        command: "SignUpUser",
                        data: { email: email, password: password },
                    },
                    (response) => {
                        console.log(response)
                        if (response.status == "failed") {
                            displayMessage(response.message, "error", 3000);
                        }else{
                            window.location.reload()
                        }
                    }
                );
            }else{
                displayMessage("Hey, Something is missing", "error")
                if(!email.length > 0){
                    signupForm["signup-email"].classList.add("input-error")
                }else if(!password.length > 0){
                    signupForm["signup-password"].classList.add("input-error")
                }
            }            
        });
    });
}

// This could be a class ui handlers
function generateLoggedInUI(){
    fetch("./views/actions.mustache")
    .then(response => response.text())
    .then(template => {
        var render = Mustache.render(template);
        document.querySelector(".actions-container").innerHTML = render;
        console.log("Mustache actions fetched")
        setLoggedInListeners();
        handleBookmarks();
        setUpSearchBar()
    })
}


function setLoggedInListeners() {
    console.log("setting up logged in listeners")
    const logoutButton = document.querySelector("#logout-btn");
    const bookmarkButton = document.querySelector("#bookmark-btn");
    const closeBookmarkButton = document.querySelector(
        "#close-bookmark-button"
    );
    const syncBookmarksButton = document.querySelector("#sync-btn");


    logoutButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ command: "SignOutUser" }, (response) => {
            window.location.reload();
        });
    });

    bookmarkButton.addEventListener("click", () => {
        getPageInfo(toggleBookmarkOverlay)
    });

    closeBookmarkButton.addEventListener("click", () => {
        toggleBookmarkOverlay();
    });

    syncBookmarksButton.addEventListener("click", () => {
        chrome.bookmarks.getTree(popBookmarkSyncOverlay);
    })

}

function displayError(error, type, color) {
    let form = document.querySelector("form");
    if (document.querySelector("#error-message")) {
        form.parentNode.removeChild(document.querySelector("#error-message"));
    }
    
    const errorMessage = document.createElement("P");
    errorMessage.id = "error-message";
    switch (type) {
        case 1:
            errorMessage.innerText = "🔴 ";
            break;
        case 2:
            errorMessage.innerText = "⚡";
            break;
        case 3:
            errorMessage.innerText = "🤔";
    }
    if (color != "") {
        errorMessage.classList.add(color);
    }
    errorMessage.innerText += error;
    form.parentNode.insertBefore(errorMessage, form.nextSibling);
}

function displayMessage(message,type = "update", timeout=2800 ){
    const body = document.querySelector("body")
    messageContainer = document.createElement("div")
    messageContainer.classList.add("message-container")
    
    switch(type){
        case "update":
            messageContainer.classList.add("message-update")
        break;
        case "error":
            messageContainer.classList.add("message-error")
        break;
    }
    const messageBody = document.createElement("p")
    messageBody.innerText = message
    messageContainer.appendChild(messageBody)
    document.querySelector("body").appendChild(messageContainer)
    messageContainer.style.animation = "dragRight 1s forwards";
    //TODO: user promises to solve sequent https://stackoverflow.com/questions/55314823/callback-function-after-settimeout/55314925
    setTimeout(() => {
        messageContainer.style.animation = "dragLeft 1s forwards";
        setTimeout(()=>{
            let errorMessages = [...document.querySelectorAll(".message-container")]
            errorMessages.forEach(errorMessage => {
                body.removeChild(errorMessage)
            })
        },timeout)
    },timeout)


}

function togglePasswordRecoveryOverlay(){

        fetch("./views/password-recovery-overlay.mustache")
        .then(response => response.text())
        .then(template => {
            var render = Mustache.render(template);
            const overlay = document.createElement("div")
            const actionsContainer = document.querySelector(".actions-container")
            overlay.classList.add("overlay")
            overlay.innerHTML += render;
            actionsContainer.appendChild(overlay);
            document.querySelector(".overlay").style.animation = "dragDown 1s forwards";
            console.log("Mustache actions fetched")
            const passwordRecoveryForm = document.querySelector("#password-recovery-form")
            passwordRecoveryForm.addEventListener("submit", (e)=>{
                e.preventDefault();
                const email = passwordRecoveryForm["recovery-email"].value
                if(email.length > 0){
                    chrome.runtime.sendMessage({ command: "ResetUserPassword",   data: { email: email} }, (response) => {
                        console.log(response)
                        if(response.status == "success"){
                            displayMessage(response.message)
                            document.querySelector(".overlay").style.animation = "dragUp 1s forwards";
                            setTimeout(()=>{
                                actionsContainer.removeChild(overlay)
                            },800)
                        }else{
                            displayMessage(response.message)
                        }
                    })
                }else{
                    displayMessage("Please, insert an email", "error", 3000)
                    passwordRecoveryForm["recovery-email"].classList.add("input-error")
                   
                }
              
                
            })
            document.querySelector("#close-bookmark-button").addEventListener("click", () => {
                document.querySelector(".overlay").style.animation = "dragUp 1s forwards";
                setTimeout(()=>{
                    actionsContainer.removeChild(overlay)
                },800)
            })
        })
    }
  

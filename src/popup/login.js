function generateLoginUI(){
    fetch("./views/login-form.mustache")
    .then(response=>response.text())
    .then(template => {
        //TODO: change user name
        let username;
        chrome.storage.local.get("user", (response) =>{
            if(response.user){
                username = response.user;
            }else{
                username = "User";
            }
            var render = Mustache.render(template, {name:username});
            
            document.querySelector(".actions-container").innerHTML = render;
            renderAvatar();

            const domScoped = {
                singupButton: document.querySelector("#signup-redirect"),
                loginForm: document.querySelector("#login-form")
            }

            domScoped.singupButton.addEventListener("click", () => {
                generateSignUpUI()
            });

            domScoped.loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = domScoped.loginForm["login-email"].value;
                const password = domScoped.loginForm["login-password"].value;

                if(email.length > 0 && password.length > 0){
                    chrome.runtime.sendMessage(
                        {
                            command: "LoginUser",
                            data: { email: email, password: password },
                        },
                        (response) => {
                            if (response.status == "failed") {
                               displayRecoveryButton(domScoped)
                            }else{
                                window.location.reload()
                            }
                        }
                    );
                    
                }else{
                    //TODO: refactor using dom object thing
                    displayMessage("Hey, Something is missing", "error")
                    if(!email.length > 0){
                        domScoped.loginForm["login-email"].classList.add("input-error")
                    }else if(!password.length > 0){
                        domScoped.loginForm["login-password"].classList.add("input-error")
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
}

function displayRecoveryButton(domScoped){
    displayMessage("Your email or password are not correct", "error");
    const recoveryBtn = document.querySelector(".recovery-btn")
    if(recoveryBtn){
        domScoped.loginForm.removeChild(recoveryBtn)
    }
    
    const passwordRecoveryButton = document.createElement("a")
    passwordRecoveryButton.addEventListener("click", () => {
        togglePasswordRecoveryOverlay();
    })
    passwordRecoveryButton.classList.add("btn-text", "margin-left-small", "recovery-btn")
    passwordRecoveryButton.innerText= "Forgot your password?"
    domScoped.loginForm.appendChild(passwordRecoveryButton)
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

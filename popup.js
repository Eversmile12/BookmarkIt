window.onload = () =>{
    console.log("hello world")
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
        document.querySelector(".status-container").innerHTML = render;
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
                       displayError(response.message)
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
                      displayError(response.message)
                    }
                })
            })
        }else{
            let logoutButton = document.querySelector("#logout-btn");
            logoutButton.addEventListener("click", ()=>{
                chrome.runtime.sendMessage({command: "SignOutUser"}, response => {
                    console.log(response.status)
                })
            })
        }
    })
}



chrome.runtime.onMessage.addListener((message, sender, callback) => {
    uiHandler(message.user)
    console.log("Message command" + message.command);
    callback({
        message: "user handler fired",
    });
    
})

   

function displayError(error){
    let formContainer = document.querySelector(".form-container");
    if(document.querySelector("#error-message")){
        formContainer.removeChild(document.querySelector("#error-message"))
    }
    let form = document.querySelector("form");
    const errorMessage = document.createElement("P");
    errorMessage.id = "error-message";
    errorMessage.innerText = "🔴" + error;
    form.parentNode.insertBefore(errorMessage, form.nextSibling)
}

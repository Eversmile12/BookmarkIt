window.onload = () =>{
    console.log("hello world")
    chrome.runtime.sendMessage({command: "checkUser"}, response =>{
        uiHandler(response.user)
    })
}


function uiHandler(user){
    console.log(user);
    if(user){
        console.log("an user have been found");
        generateForm("actions.mustache", "loggedIn");
        const logoutButton = document.createElement("button");
        logoutButton.innerText = "logOut";
        logoutButton.addEventListener("click", ()=>{
            chrome.runtime.sendMessage({command: "SignOutUser"}, response => {
                console.log(response.status)
            })
        })
        document.body.appendChild(logoutButton)
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
            const loginForm = document.querySelector("#login-form");

            document.querySelector(".signup-redirect").addEventListener("click", () => {
                generateForm("signup-form.mustache", "signUp")
            })
            loginForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const email = loginForm["login-email"].value;
                const password = loginForm["login-password"].value;

                chrome.runtime.sendMessage({command: "LoginUser", data:{email: email, password: password}}, response => {
                    console.log("response: " + response.message);
                    if(response.status == "failed"){
                        const errorMessage = document.createElement("P");
                        errorMessage.innerText = response.message;
                        document.body.appendChild(errorMessage);
                    }
                })
            })
        }else if(status == "signUp"){
            const signupForm = document.querySelector("#signup-form");
            signupForm.addEventListener('submit', (e)=>{
                e.preventDefault();
                const email = signupForm["signup-email"].value;
                const password = signupForm["signup-password"].value;
                console.log(email);
                console.log(password)

                chrome.runtime.sendMessage({command: "SignUpUser", data:{email: email, password: password}}, response => {
                    console.log(response.message);
                    if(response.status == "failed"){
                        const errorMessage = document.createElement("P");
                        errorMessage.innerText = response.message;
                        document.body.appendChild(errorMessage);
                    }
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

   



// if(!isLoggedIn){
    
// }
window.onload = () =>{
    console.log("hello world")
    chrome.runtime.sendMessage({command: "checkUser"}, response =>{
        uiHandler(response.user)
    })
}


function uiHandler(user){
    if(user){
        console.log("an user have been found");
        generateForm("actions.mustache", true);
        const logoutButton = document.createElement("button");
        logoutButton.innerText = "logOut";
        logoutButton.addEventListener("click", ()=>{
            chrome.runtime.sendMessage({command: "SignOutUser"}, response => {
                console.log(response.status)
            })
        })
        document.body.appendChild(logoutButton)
    }else{
        generateForm("login-form.mustache", false)
        
    }
}

function generateForm(template, isLoggedIn){
    fetch("./views/"+template)
    .then((response) => response.text())
    .then((template) => {
        var render = Mustache.render(template, {synched: false});
        document.querySelector(".status-container").innerHTML = render;
        if(!isLoggedIn){
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
    console.log(message.command);
    callback({
        message: "user handler fired",
    });
    
})

    
    
    // fetch("./views/actions.mustache")
    // .then((response) => response.text())
    // .then((template) => {
    //         var render = Mustache.render(template, {synched: false});
    //         document.querySelector(".actions-container").innerHTML = render;
    //         //TODO check if user has already synched


    // })
// }


// function bookMarkIt(tabUrl){
//     console.log(tabUrl);
//     // chrome.runtime.sendMessage()
// }



// document.getElementById("bm-current-btn").addEventListener("click", () =>{

//     chrome.runtime.sendMessage( {command: "generateDetailWindow"}, response =>{
//         console.log(response.message);
//     })
    
// })
 
    
    // detailWindowHeader = document.createElement("H2");
    // detailWindowHeader.innerText = "It's time to Boomark! ";
    
    // detailWindowSubheader = document.createElement("P");
    // detailWindowSubheader.innerText = "Add something meaningful";

    // detailInputTitleLabel = document.createElement("LABEL");
    // detail
    // detailInputTitle = document.createElement("INPUT");
    // detailInputTitle.setAttribute("type", "text");
    // detailInputTitle.value = tabTitle;

    // detailWindowContainer.appendChild(detailWindowHeader);
    // detailWindowContainer.appendChild(detailWindowSubheader);
    // detailWindowContainer.appendChild(detailInputTitle);
    // document.body.appendChild(detailWindowContainer);




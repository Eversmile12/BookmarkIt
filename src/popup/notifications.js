

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
            if(errorMessages){
                errorMessages.forEach(errorMessage => {
                    body.removeChild(errorMessage)
                })
            }
           
        },timeout)
    },timeout)


}

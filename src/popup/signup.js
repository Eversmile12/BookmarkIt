function generateSignUpUI(){

    fetch("./views/signup-form.mustache")
    .then(response=>response.text())
    .then(template => {
        var render = Mustache.render(template);
        document.querySelector(".actions-container").innerHTML = render;
        
        const domScoped = {
            signinButton: document.querySelector("#signin-redirect"),
            signupForm: document.querySelector("#signup-form")
        }

        domScoped.signinButton.addEventListener("click", () => {
            generateLoginUI()
        });
        domScoped.signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = domScoped.signupForm["signup-email"].value;
            const password = domScoped.signupForm["signup-password"].value;
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
                    domScoped.signupForm["signup-email"].classList.add("input-error")
                }else if(!password.length > 0){
                    domScoped.signupForm["signup-password"].classList.add("input-error")
                }
            }            
        });
    });
}
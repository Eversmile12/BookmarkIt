document.getElementById("bm-current-btn").addEventListener("click", () =>{

    chrome.runtime.sendMessage( {command: "generateDetailWindow"}, response =>{
        console.log(response.message);
    })
    
})


function bookMarkIt(tabUrl){
    console.log(tabUrl);
    // chrome.runtime.sendMessage()
}




 
    
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







//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged


  
  let contextMenuFastSave = function(){
    console.log("Menu fast save clicked")
    getPageInfo(fastSaveBookmark)
} 

chrome.contextMenus.create({
    "title":"Bookmark It!",
    "contexts": ["page", "selection", "image", "link"],
    "onclick" : contextMenuFastSave
})



 
  
  


  


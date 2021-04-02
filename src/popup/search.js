function setUpSearchBar(){
    console.log("setting up search bar")
    const searchBar = document.createElement("input");
        searchBar.setAttribute("type","text");
        searchBar.setAttribute("placeholder", "search");
        searchBar.classList.add("searchbar");
        document.querySelector(".header-container").appendChild(searchBar)
        searchBar.addEventListener("input", ()=>{
            chrome.storage.local.get(["ubookmarks"], (response) =>{
                if(response.ubookmarks.length > 0){
                    let bookmarksFiltered = response.ubookmarks.filter((bookmark)=>{
                        const searchbarValue = searchBar.value.toLowerCase()
                        let searchPhrase = bookmark.bmTitle + " "
                        if(bookmark.bmTags){
                            searchPhrase += bookmark.bmTags
                        }
                        if(searchPhrase.toLowerCase().includes(searchbarValue)){
                            return true;
                        }else{
                            return false;
                        };
                    })
                    generateBookmarkListItem(bookmarksFiltered)
                }
                
            })
        })
}

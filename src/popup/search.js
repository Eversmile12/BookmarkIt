function setUpSearchBar(){
    console.log("setting up search bar")
    const searchBar = document.createElement("input");
        searchBar.setAttribute("type","text");
        searchBar.setAttribute("placeholder", "search");
        searchBar.classList.add("searchbar");
        document.querySelector(".header-container").appendChild(searchBar)

        searchBar.addEventListener("input", ()=>{
            chrome.storage.local.get(["ubookmarks"], (response) =>{

                if(Object.keys(response.ubookmarks).length > 0){
                    console.log("searching")
                    const searchbarValue = searchBar.value.toLowerCase()
                    let bookmarksFiltered  = searchThroughTree(response.ubookmarks, searchbarValue)

                    
                    
                    
                    // response.ubookmarks.filter((bookmark)=>{
                        

                       
                    //     if(bookmark.children){
                    //         for(const child in bookmark.children){
                    //             searchPhrase += bookmark.child[child].bmTitle + " " + bookmark.child[child].bmTags
                    //         }
                    //     }
                    //     console.log(searchPhrase)
                        
                    // })
                    generateBookmarkListItem(bookmarksFiltered)
                }
                
            })
        })
}


const searchThroughTree = (tree,searchbarValue) => {
    let filteredTree = [];
    console.log(tree)
    for(const item in tree){
        let itemTemp = tree[item]
        let searchPhrase; 

        if(itemTemp.children){
            if(item.toLowerCase().includes(searchbarValue)){
                filteredTree.push(itemTemp)
            }else{
                for(const child in itemTemp.children){
                    let childTemp = itemTemp.children[child]
                    searchPhrase = childTemp.bmTitle + " "

                    if(childTemp.bmTags){
                        searchPhrase += childTemp.bmTags + " "
                    }
                    if(searchPhrase.toLowerCase().includes(searchbarValue)){
                        filteredTree.push(childTemp)
                    }
                    searchPhrase = "";
                }
            }            
        }else{
            searchPhrase = itemTemp.bmTitle + " "
           
            if(itemTemp.bmTags){
                searchPhrase += itemTemp.bmTags + " "
            }
            console.log(searchPhrase)
            if(searchPhrase.toLowerCase().includes(searchbarValue)){
                filteredTree.push(tree[item])
            }
            searchPhrase = "";
        }       
        
    }
    console.log("filteredTree:")
    console.log(filteredTree)
    return filteredTree
}
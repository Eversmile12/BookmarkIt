var mustache = document.createElement('script');  
mustache.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/mustache.js/4.1.0/mustache.min.js')
document.head.appendChild(mustache);

detailWindowContainer = document.createElement("DIV");
  fetch("bm_overlay.mustache")
  .then((response) => response.text())
  .then((template) => {
        var render = Mustache.render(template, {tabTitle: document.title, tabUrl: window.location});
        detailWindowContainer.innerHTML = render;
        document.body.appendChild(detailWindowContainer);

     
  })



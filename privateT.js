window.onload = function(){
  log('start');
  main();
}

function main(){
  log('main')
  replaceWordsOnPage(append_code);
}

function replaceWordsOnPage(f){
  str = document.body.innerHTML 
  chrome.runtime.sendMessage({command: "replace_words", html:str}, function(response) {
    log('get replaced html')
    document.body.innerHTML = response.html
    f()
  });
  
}

function append_code(){
  //upload templates
  callAjax(chrome.extension.getURL('templates.html'), function(response){
    //inject tempate
    document.body.insertAdjacentHTML( 'afterend', response );
    //inject scipt
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('inject.js');
    s.onload = function() {
        this.parentNode.removeChild(this);
    };
    (document.head||document.documentElement).appendChild(s);

  })
  

  
}

function log(text){
  console.log("TutYou:: "+text)
}

function callAjax(url, callback){
    var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
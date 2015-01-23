﻿const dbName = "TutYouDB";
window.notification_tab={}
load();
function load(){
  log("Start load")
  load_or_create_db(function(){/*do nothing after load*/},1);
}

chrome.runtime.onInstalled.addListener(function() {
  var context = "selection";
  var title = "Добавить в TutYou";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                         "id": "context" + context});  
});
chrome.contextMenus.onClicked.addListener(add_context_word);

//interface
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.command){
      case "get_ws":
        ws_from_db(function(ws){
          sendResponse({ws: ws});
        })
        break;
      case "add_word":
        add_raw_word(JSON.parse(request.word),function(result){
          sendResponse(result);
        });
        break;
      case "update_word":
        update_word(JSON.parse(request.word),function(result){
          sendResponse(result);
        });
        break;
      case "remove_word":
        remove_word(request.id,function(result){
          sendResponse(result);
        });
        break;
      case "get_word":
        get_word(request.id,function(result){
          sendResponse(result);
        });
        break;
      
    }
      
    return true //keep chanal openned!
  }
);


function reset(){
  indexedDB.deleteDatabase(dbName);
}
function load_or_create_db(f,ver){
  log("load db "+ver)
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  if (!window.indexedDB) {
     window.alert("IndexedDB не работает => TutYou работать не будет. Обновите бразуер или удалите расширение");
  }
  

  var request = indexedDB.open(dbName, ver);

  request.onerror = function(err) {
    log('load failed -> '+err.target.error.name+':'+err.target.error.message);
    if(err.target.error.name=="VersionError"){
      new_ver = +err.target.error.message.slice(61,-2)
      load_or_create_db(f,new_ver)
    }
  };
  request.onsuccess = function(){
    log("load success");
    f();
    window.DB = request.result
  };
  request.onupgradeneeded = function(event) {
    if(event.oldVersion==0){
      log("create db");
      var db = event.target.result;
      var objectStore = db.createObjectStore("words", { keyPath: "id", autoIncrement: true });
      objectStore.createIndex("id", "id", { unique: true });
      objectStore.createIndex("ru_word", "ru_word");
      objectStore.createIndex("en_word", "en_word");
      load_or_create_db(f,ver);  
    }else{
      log("update");
    }
  };
}

function ws_from_db(callback){
  log('extract ws from db');
  while(typeof(DB)=="undefined") log('Wait DB appear...')
  var objectStore = DB.transaction(["words"]).objectStore("words");
  ws = {words:[],version:DB.version}
  objectStore.openCursor().onsuccess = function(event) {
    var cursor = event.target.result;
    if (cursor) {
      ws.words.push(cursor.value)
      cursor.continue();
    }else{
      callback(ws)
    }
  };
}

function add_raw_word(word,f){
  log('add raw word '+word.ru_orig+" "+word.en_orig)
  word.ru_orig = word.ru_orig.toLowerCase()
  word.en_orig = word.en_orig.toLowerCase()
  word.ru_word=getPho(word.ru_orig,'russian')
  word.en_word=getPho(word.en_orig,'english')
  word.counter = 0
  word.learned = false
  word.created_at = new Date()
  add_word_to_db(word,f)
}
function add_word_to_db(word,f){
  log('add word to DB...')
  var transaction = DB.transaction(["words"], "readwrite")
  
  
  request = transaction.objectStore("words").add(word);

  request.onerror = function(event) {
    log("add word to DB error -> "+event.target.error.message)
    if(typeof(f)=="function") f({status:"ERROR",error:event.target.error});
    
  };

  request.onsuccess = function(event){
    log('add word to DB was success!')
    if(typeof(f)=="function") f({status:"OK",word:word, id:event.target.result});
  }
}


function update_word_sync(word){
  window.current_words_update_index = 0
  window.current_words_update_index_max = words.length-1
  window.words_update_function  = function(){
    current_words_update_index +=1
    if(current_words_update_index<=current_words_update_index_max)
      update_word(words[current_words_update_index],words_update_function)
  }
  update_word(words[0],words_update_function)
}

function update_word(word_keys, f){
  os =DB.transaction(["words"], "readwrite").objectStore("words")
  db_word_request = os.get(word_keys.id)
  window.word_keys = word_keys//bad passing variable
  window.f_callback = f//TODO fixit
  db_word_request.onsuccess = function(event){
    orig = event.target.result
    var merged = {};
    for (var attrname in orig) { merged[attrname] = orig[attrname]; }
    for (var attrname in word_keys) { merged[attrname] = word_keys[attrname]; }
    os =DB.transaction(["words"], "readwrite").objectStore("words")
    var updateTitleRequest = os.put(merged);
    updateTitleRequest.onsuccess = function() {
      f_callback({status:"OK"})
    };
  
  }
}

function remove_word(id,f){
  
  var request = DB.transaction(["words"], "readwrite")
                .objectStore("words")
                .delete(id);
  request.onsuccess = function(event) {
    f({status:"OK"})
  };
} 

function get_word(id,f){
  var request = DB.transaction(["words"], "readwrite")
                .objectStore("words")
                .get(id);
  request.onsuccess = function(event) {
    f({status:"OK",word:request.result})
  };
  request.onerror = function(event){
    f({status:"ERROR"})
  }
}

function log(text){
  console.log("TutYou:: "+text)
}

function add_context_word(info,tab){
   var sText = info.selectionText;
   translate(sText, function(word){
    add_raw_word(word, function(result){
      word = result.word
      id = result.id
      options = {type:'basic',
              iconUrl:'../assets/TutYou4.png',
              title:'Слово добавлено!',
              message: word.ru_orig+" - "+word.en_orig,
              buttons:[{title:'Изменить', iconUrl:'../assets/edit.png'},{title:'Отменить', iconUrl:'../assets/delete.png'}]}
      notification_tab[id]=tab.id
      chrome.notifications.create(id.toString(), options, function f(id){ /*nothing*/})
    });
   });
   
}

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
  if(buttonIndex==0){//изменить
    var newURL = chrome.extension.getURL('options/options.html');
    chrome.tabs.create({ url: newURL+'?edit='+notificationId+'&tab='+notification_tab[+notificationId] });
  }else{//отменить
    remove_word(+notificationId,function(){/*nothing*/})
  }
});


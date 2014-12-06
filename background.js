const dbName = "TutYouDB";
load();
function load(){
  log("Start load")
  load_or_create_db(function(){/*do nothing after load*/},1);
}
//interface
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.command){
      case "get_ws":
        ws_from_db(function(ws){
          sendResponse({ws: JSON.stringify(ws)});
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
      case "replace_words":
        replace_words(request.html,function(html){
          sendResponse({html:html});
        });
        break;
    }
      
    return true //keep chanell openned!
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
  
  transaction.onerror = function(event) {
    log("add word to DB error -> "+event.target.error.message)
    if(typeof(f)=="function") f({status:"ERROR",error:event.target.error});
    
  };
  transaction.oncomplete = function(){
    log('add word to DB was success!')
    if(typeof(f)=="function") f({status:"OK",word:word});
  };
  
  transaction.objectStore("words").add(word);
}

function replace_words(html, f){
  
  ws_from_db(function(ws){
    updated_words = []
    ws.words.forEach(function(word){
      counter =0
      html = html.replace(RegExp("[А-Яа-я]*"+word.ru_word+"[А-Яа-я]*", "gi"), function(str){
        if (getPho(str.toLowerCase(),'russian').localeCompare(word.ru_word)==0){
          counter+=1
          ret_str = ""
          if(str[0]=== str[0].toUpperCase()){
            retval = word.en_orig;
            retval = retval[0].toUpperCase()+retval.slice(1);
            ret_str= retval;
          }else{
            ret_str = word.en_orig;
          }
        
          class_name = word.learned ? 'learned' : 'notlearned' 

          return "<span class=\""+class_name+" tutyou\" data-percent='0'><span>"+ret_str+
          "</span><span class='translation'>"+str+"</span></span>";
        }else{
          return str;
        }
      });
      if(counter!=0){
        word.counter+=counter;
        updated_words.push(word)
      }
    })
    update_words(updated_words)
    f(html);
  })
}

function update_words(words){
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
  db_word_request.onsuccess = function(){
    orig = db_word_request.result
    var merged = {};
    for (var attrname in orig) { merged[attrname] = orig[attrname]; }
    for (var attrname in word_keys) { merged[attrname] = word_keys[attrname]; }
    
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


function getPho(word,lang){
  var testStemmer = new Snowball(lang);
  testStemmer.setCurrent(word);
   testStemmer.stem();
   return testStemmer.getCurrent();
}


function log(text){
  console.log("TutYou:: "+text)
}



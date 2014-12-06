window.onload = function(){
  log('start');
  loadWS(main);
}

function loadWS(fun) {
  log('loading...');
  chrome.runtime.sendMessage({command: "get_ws"}, function(response) {
    json_ws = response.ws
    log('loaded -> '+json_ws.slice(0,30)+"...");
    window.WS=JSON.parse(json_ws);
    fun();
  });  
}

function main(){
    fill_words_list();
}

function fill_words_list(){
    WS.words.forEach(function(word){
        
        line = $('.template').clone()
        line.removeClass('template').addClass('line')
        line.find('.id span').html(word.id)
        line.find('.ru-orig span').html(capitalise(word.ru_orig))
        line.find('.en-orig span').html(capitalise(word.en_orig))
        line.find('.date span').html(date_str(new Date(word.created_at)))
        line.find('.counter span').html(word.counter)
        if(word.learned){
            line.find('.learn-state .not-learned').hide()
            line.find('.learn-state .learned').show()
        }else{
            line.find('.learn-state .not-learned').show()
            line.find('.learn-state .learned').hide()
        }
        $('.added-words').append(line)

    });
}

$(".added-words").on('click','.learn-state img',function(){
    if($(this).hasClass('learned')){
        learned=false;
        shown_class='.not-learned'
    }else{
        learned=true;
        shown_class='.learned'
    }
    id = +$(this).parents('.line').find('.id span').html()
    var cur_img = $(this)
    chrome.runtime.sendMessage({command: "update_word", word:JSON.stringify({id:id,learned:learned})}, function(response) {

        cur_img.hide()
        cur_img.parent().children(shown_class).show()
    });
})

$(".added-words").on('click','.remove img',function(){
    id = +$(this).parents('.line').find('.id span').html()
    window.cur_img = $(this)
    chrome.runtime.sendMessage({command: "remove_word", id:id}, function(response) {
        cur_img.parents('.line').remove()
    });
});

function log(text){
  console.log("TutYou:: "+text)
}

function capitalise(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function date_str(date){
    if(date){
        var dd = date.getDate();
        var mm = date.getMonth()+1; //January is 0!
        var yyyy = date.getFullYear();

        if(dd<10) {
          dd='0'+dd
        } 

        if(mm<10) {
          mm='0'+mm
        } 

        date = dd+'/'+mm+'/'+yyyy;
        return date;      
    }else{
        return '**/**/**';
    }
  
}
alert("скрываю видео! v4")

var dyg_num = 0, dyg_numes = 0;


function add_style()
{
   if(hide_style==null){
       hide_style = GM_addStyle(`#hide_video
       {
       display: none !important;
       }`)
    //    console.log(2,hide_style)
   }else{
       hide_style.remove()
       hide_style = null
    //    console.log(1,hide_style)
   }
}



function non_video()
{
    frames = document.querySelectorAll('.style-scope.ytd-grid-renderer');
    dyg_numes = 0;

    for(let i = 0; i<frames.length;i++) {
        if(frames[i].querySelector('div#progress')!=null && frames[i].style.display != 'none' && frames[i].id !="items" && frames[i].id !="hide_video")
        {
            //if(parseInt(frames[i].querySelector('div#progress').style.width)>=prochent)
            //{
                frames[i].style.display = 'none'
                //frames[i].parentElement.removeChild(frames[i])
                //frames[i].id = 'hide_video'
                dyg_numes++
                dyg_num++
            //}
        }
    }
    if(document.querySelector('span#country-code')){
        document.querySelector('span#country-code').textContent = parseInt(dyg_num);
        console.log(dyg_num)
    }
}

//var menuCmdprochent = GM_registerMenuCommand('Пропуск выключен', () => {
//    let str=prompt("Запрос на ввод данных", 0);
//})


document.querySelector("body").onscroll = function(){
    non_video()
}


document.addEventListener('keydown', function(event) {
    if(event.repeat==false){
        if(event.key=="\\"&&event.ctrlKey==true&&event.shiftKey==false&&event.altKey==false){
            // add_style()
        }
    }
})

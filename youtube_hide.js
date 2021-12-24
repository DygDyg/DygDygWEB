alert("скрываю видео!")




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
    numes = 0;

    if(frames.length==0){
        if(document.querySelectorAll('ytm-compact-video-renderer.item').length!=0){
            frames = document.querySelectorAll('ytm-compact-video-renderer.item')
            modile_func()
        }
        return
    }else{
        desktop_func()
    }




    //document.querySelector('span#country-code').textContent = num;
    //return numes;
}


//$('.style-scope.ytd-grid-renderer').on('change', function(){
//    console.log()
//});

function desktop_func()
{
    for(let i = 0; i<frames.length;i++) {
        if(frames[i].querySelector('div#progress')!=null && frames[i].style.display != 'none' && frames[i].id !="items" && frames[i].id !="hide_video")
        {
            //if(parseInt(frames[i].querySelector('div#progress').style.width)>=prochent)
            //{
                frames[i].style.display = 'none'
                //frames[i].parentElement.removeChild(frames[i])
                //frames[i].id = 'hide_video'
                numes++
                num++
            //}
        }
    }
    if(document.querySelector('span#country-code')){
        document.querySelector('span#country-code').textContent = num;
    }
}

function modile_func()
{
    for(let i = 0; i<frames.length;i++) {
        if(frames[i].querySelector('.thumbnail-overlay-resume-playback-progress')!=null && frames[i].id !="hide_video")
        {
            if(parseInt(frames[i].querySelector('.thumbnail-overlay-resume-playback-progress').style.width)>=prochent)
            {
            //frames[i].style.display = 'none'

            frames[i].id = 'hide_video'
            numes++
            num++
            }
        }
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

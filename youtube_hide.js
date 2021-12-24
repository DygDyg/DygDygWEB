var dyg_num = 0, dyg_numes = 0, dyg_ver = "v7";

console.log("скрываю видео! "+dyg_ver)

function non_video()
{
    frames = document.querySelectorAll('.style-scope.ytd-grid-renderer');
    dyg_numes = 0;

    for(let i = 0; i<frames.length;i++) {
        if(frames[i].querySelector('div#progress')!=null && frames[i].style.display != 'none' && frames[i].id !="items" && frames[i].id !="hide_video")
        {
                frames[i].style.display = 'none'
                dyg_numes++
                dyg_num++
        }
    }
    if(document.querySelector('span#country-code')){
        document.querySelector('span#country-code').textContent = "Скрыто видео: "+parseInt(dyg_num)+" "+dyg_ver;
    }
}

document.querySelector("body").onscroll = function(){
    non_video()
}


//document.addEventListener('keydown', function(event) {
//    if(event.repeat==false){
//        if(event.key=="\\"&&event.ctrlKey==true&&event.shiftKey==false&&event.altKey==false){
//           
//        }
//    }
//})
//
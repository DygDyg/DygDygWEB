edge = false
function fav_text(text) {
    if (text.length == 1) {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 128
        const ctx = canvas.getContext('2d')
        const x = canvas.width / 2
        const y = canvas.height / 2
        const fix = 10 //Отступ


        // ctx.fillStyle = 'white'
        ctx.roundRect(0 + fix, 0 + fix, canvas.width - fix - fix, canvas.height - fix - fix, 10)
        // ctx.fill()
        ctx.strokeStyle = '#d6d6d6';
        ctx.lineJoin = "round";
        ctx.lineWidth = 16;
        ctx.stroke()
        ctx.clip()

        ctx.strokeStyle = '#000'

        ctx.font = 'bold 98px serif'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.strokeText(text, x, y)
        // ctx.stroke()
        // ctx.clip()

        // ctx.fillStyle = '#04ff00'
        ctx.fillStyle = 'white'
        ctx.font = 'bold 95px serif'
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.fillText(text, x, y)
        ctx.clip()



        canvas.toBlob(blob => document.querySelector('#favicon').setAttribute('href', URL.createObjectURL(blob)))
        if (edge) document.body.append(canvas)
    }
}

document.addEventListener('keydown', function (e) {
    console.log(e);

    switch (e.key) {
        case "ArrowUp":
            fav_text("▲")
            break;
        case "ArrowLeft":
            fav_text("◄")
            break;
        case "ArrowRight":
            fav_text("►")
            break;
        case "ArrowDown":
            fav_text("▼")
            break;
        case "Shift":
            fav_text("♣")
            break;
        case "Alt":
            fav_text("☻")
            break;
        case "Control":
            fav_text("♫")
            break;
        case "Meta":
            fav_text("▀")
            break;
        case " ":
            fav_text("▓")
            break;
        case "F8":
            if (e.ctrlKey) {
                let aaaaa = "®֍▓█░☺☻◄▼►▲♣♥♦♪♫☼♀♂♠□■BPKLY6756[".split('');

                setInterval(function() {
                    fav_text(aaaaa[Math.floor(Math.random() * (aaaaa.length-1))])                   
                  }, 500);
            } else {
                edge = !edge
                console.log(edge)
            }
            break;
        default:
            fav_text(e.key.toUpperCase())
            break;
    }
})

document.addEventListener('keyup', function (e) {
    // console.log(e.key);
    // fav.href = "favicon/default.svg"
});

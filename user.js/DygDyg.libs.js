class Debug {
    log(mes) {
        if (typeof dev !== 'undefined') {
            if (dev == true) {
                console.log(mes)
            }
        }
    }
}
const debug = new Debug();
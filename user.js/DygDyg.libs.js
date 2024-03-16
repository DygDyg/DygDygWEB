class Debug {
	log(mes) {
		if (typeof dev !== 'undefined') {
            console.log(mes)
        }
	}
}
const debug = new Debug();
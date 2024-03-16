class Debug {
	log(mes) {
		if (!dev) return
		console.log(mes)
	}
}
const debug = new Debug();
class Debug {
	log(mes) {
		if (!dev) return
		console.log(mes)
	}
}
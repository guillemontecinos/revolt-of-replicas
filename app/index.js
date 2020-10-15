const express = require("express")
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const OSC = require('osc-js')
const fs = require('fs')
const Instagram = require('instagram-web-api')

const expressPort = 3000

let imageReg = []

//=======================================================
// Ig web api params
//=======================================================
const igUsername = 'larevueltadelasreplicas'
const igPassword = 'PineraCuliao19'
const client = new Instagram({username: igUsername, password: igPassword})

//========================================================
// clear /private 
//========================================================
// code source: https://arjunphp.com/how-to-delete-a-file-in-node-js/
const deleteFolderRecursive = function (directory_path) {
    if (fs.existsSync(directory_path)) {
        fs.readdirSync(directory_path).forEach(function (file, index) {
            var currentPath = path.join(directory_path, file)
            if (fs.lstatSync(currentPath).isDirectory()) {
                deleteFolderRecursive(currentPath)
            } else { 
				fs.unlinkSync(currentPath) // delete file
            }
        })
    }
}

// checks if /private existes and clears it, otherwise creates it
let privatePath = __dirname + '/private' 
if(fs.existsSync(privatePath)){
	deleteFolderRecursive(privatePath)
}
else{
	fs.mkdirSync(privatePath)
}

//========================================================

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// HTTP framework for socket
const httpPort = 80
server.listen(httpPort)

// OSC framework
const options = { send: { port: 12345 } }
const osc = new OSC({ plugin: new OSC.DatagramPlugin(options) })

//====================================================
// get and post
//====================================================
app.use(express.static('public'))

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/welcome.html'))
	// send osc message to unity to switch to welcome scene
	let message = new OSC.Message(['scene'], 'welcome')
	osc.send(message, {host: 'localhost'})
})

app.get('/experience', function (req, res) {
	console.log('request to experience received')
	res.sendFile(path.join(__dirname + '/public/experience.html'))
	// send osc message to unity to switch to experience scene
	let message = new OSC.Message(['scene'], 'experience')
	osc.send(message, {host: 'localhost'})
	// clear imageReg when experience scene is loaded
	while(imageReg.length > 0) imageReg.pop()
})

app.get('/reality', function (req, res) {
	if(Number(req.query.id) == 800){
		// request of last screenshot on post experience
		let reqPath = path.join(imageReg[imageReg.length - 1])
		// let reqPath = path.join(__dirname + '/private/2.jpg')
		console.log('sending: ' + reqPath)
		res.sendFile(reqPath)
	}
	else{
		// request of screenshots on experience
		if(imageReg.length > 0) {
			let reqPath = path.join(imageReg[Number(req.query.id)])
			console.log('sending: ' + reqPath)
			res.sendFile(reqPath)
		}
		else {
			res.err
		}
	}
})

app.get('/post-experience', function (req, res) {
	// with internet connection =========================================
	if(imageReg.length == 0){
		res.sendFile(path.join(__dirname + '/public/welcome.html'))
	}
	else {
		let message = new OSC.Message(['scene'], 'welcome')
		osc.send(message, {host: 'localhost'})
		res.sendFile(path.join(__dirname + '/public/post-experience.html'))
	}
	// with internet connection =========================================

	// without internet connection ======================================
	// res.sendFile(path.join(__dirname + '/public/post-experience-2.html'))
	// without internet connection ======================================
})

app.post('/post-to-instagram', function (req, res){
	const photo = imageReg[imageReg.length - 1]
	client
	.login()
	.then(() => {
		client.uploadPhoto({ photo: photo, caption: req.body.comment, post: 'feed' })
	})
})

//========================
// osc connection to unity
//========================
// Source: https://github.com/adzialocha/osc-js/wiki/Node.js-Server
osc.on('open', function(){
	osc.send(new OSC.Message('/hello'), { host: 'localhost'})
})

//=============================
// Sockets connection to client
//=============================
// Source: https://socket.io/docs/#Using-with-Express
io.on('connection', function(socket){
	console.log('Device Connected')
	socket.emit('connection answer', {hello: 'world'})
	socket.on('speed event', function(data){
		// console.log(data.my + ' at ' + data.speed + ' px/s')
		let message
		try {
			message = new OSC.Message(['swipespeed'], data.speed.toString())
		}
		catch (err) {
			console.log(err)
			message = new OSC.Message(['swipespeed'], '0.0')
		}
		osc.send(message, {host: 'localhost'})
	})
	socket.on('double tap', function(data){
		console.log(data)
		let message = new OSC.Message(['doubletap'], data)
		osc.send(message, {host: 'localhost'})
	})

	// osc listener inside socket connection
	osc.on('/screenshot', message => {
		console.log(message)
		// TODO: check why it's receiving two messages
		let aux = message.args[0].split('/')
		let localPath =  __dirname + '/private/' + aux[aux.length - 1]
		setTimeout(function(){
			fs.copyFile(message.args[0],localPath, (err) => {
				if (err) throw err;
				// this is to avoid duplications in the image reg because as the osc.on is declared inside the io.on, every event gets duplicated
				if(imageReg.length == 0 || imageReg.length > 0 && imageReg[imageReg.length - 1] != localPath) {
					imageReg.push(localPath)	
				} 
				let arr = message.args[0].split('/')
				let len = arr.length
				let file = arr[len - 1]
				console.log('receiving: ' + file)
				socket.emit('screenshot added', {id: file.split('.')[0]})
			})
		}, 300)
	})
})

app.listen(expressPort, function () {
	console.log("Example app listening on port " + expressPort)
})

osc.open({ port: 9001 }) // bind socket to localhost:9000
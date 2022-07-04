const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, '.');
	},
	filename: (req, file, cb) => {
		const { originalname } = file;
		cb(null, 'Pres.pdf');
	}
});
const app = express();
const upload = multer({ storage });
const { exec } = require('child_process');

var fs = require('fs'); //require filesystem module

var speed=0;
var font=0;
var scrollTop=0;
var promptState=0;

var fields=0;
var scrollHeight=0;
var clientWidth=0;
var clientHeight=0;
var innerWidth=0;
var initialfontoper=0;
var TEXT="";
var initialtupdate=30;
var MainConected=false;

var wsCt={};

/*var http = require('http').createServer(handler); //require http server, and create server with function 
http.listen(80); //listen to port 80
function handler(req, res) { //create server 
	let fname="";
	switch(req.url){
		case "/":
			fname="/Main.html";
		break;
		default:
			fname=req.url;
	}
	fs.readFile(__dirname + fname, function(err, data) { //read file index.html in public folder
		if (err) {
		res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
		return res.end("404 Not Found");
		}
		res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
		res.write(data); //write data from index.html
		return res.end();
	});
}*/

app.use(express.static('.'));
app.post('/pdf', upload.single('pdf-file'),(req,res) => {
});

app.listen(80);

const WebSocket1 = require('ws');
const wsServer1 = new WebSocket1.Server({port: 8889});
wsServer1.on('connection', onConnect1);

function onConnect1(wsClient) {
	wsCt=wsClient;
	MainConected=true;
	
	wsClient.on('message', function(e) {
		if (wsCt==wsClient){
			//console.log("sock1: "+e+"\n");
			let sockArr=[];
			let currents=false;
			let bases=false;
			let texts=false;
			if (e.slice(0,5)=="TEXT="){sockArr.push(e);} else {sockArr=e.split(";");}
			sockArr.forEach((ee) => {
				let sockCom=[];
				if (ee.slice(0,5)=="TEXT="){sockCom.push("TEXT");sockCom.push(ee.slice(5,ee.length));} else {sockCom=ee.split("=");}
				switch(sockCom[0]){
					case "scrollTop":
						scrollTop=parseFloat(sockCom[1]);
						currents=true;
					break;
					case "speed":
						speed=parseInt(sockCom[1]);
						currents=true;
					break;
					case "promptState":
						promptState=parseInt(sockCom[1]);
						currents=true;
					break;
					case "font":
						font=parseInt(sockCom[1]);
						bases=true;
					break;
					case "fields":
						fields=parseInt(sockCom[1]);
						bases=true;
					break;
					case "scrollHeight":
						scrollHeight=parseInt(sockCom[1]);
						bases=true;
					break;
					case "clientWidth":
						clientWidth=parseInt(sockCom[1]);
						bases=true;
					break;
					case "initialfontoper":
						initialfontoper=parseInt(sockCom[1]);
						bases=true;
					break;
					case "clientHeight":
						clientHeight=parseInt(sockCom[1]);
						bases=true;
					break;
					case "innerWidth":
						innerWidth=parseInt(sockCom[1]);
						bases=true;
					break;
					case "TEXT":
						TEXT=sockCom[1];
						texts=true;
					break;
					case "initialtupdate":
						initialtupdate=parseInt(sockCom[1]);
						bases=true;
					break;
					default:
				}
			});
			if (texts){
				SubmitText();
			}
			else if (bases){
				SubmitBase();
			}
			else if (currents){
				SubmitCurrent();
			}
		}
	});

	wsClient.on('close', function() {
		if(wsClient==wsCt){
			MainConected=false;
			for (var member in wsCt) delete wsCt[member];
		}
	});
}

const WebSocket2 = require('ws');
const wsServer2 = new WebSocket2.Server({port: 8890});
wsServer2.on('connection', onConnect2);

function onConnect2(wsClient) {
	submitsendText(wsClient);
	submitsendBase(wsClient);
	submitsendCurrent(wsClient);
	wsClient.on('message', function(e) {
		//console.log("sock2: "+e+"\n");
		let sockCom=[];
		let temp=e.slice(0,8);
		if ((temp=="newnetw=")||(temp=="newtext=")||(temp=="newtex0=")||(temp=="newtex1=")||(temp=="newtex2=")||(temp=="newtex3=")||(temp=="newtex4=")||(temp=="newtex5=")||(temp=="newtex6=")||(temp=="newtex7=")||(temp=="newtex8=")||(temp=="newtex9=")||(temp=="newsett=")){sockCom.push(temp.slice(0,7));sockCom.push(e.slice(8,e.length));} else {sockCom=e.split("=");}
		switch(sockCom[0]){
			case "scrollTop":
				MainSend('scrollTop='+parseFloat(sockCom[1]));
			break;
			case "speed":
				let tempspeed=parseInt(sockCom[1]);
				if (fs.existsSync("Pres.pdf")){
					if (tempspeed<speed){
						exec("xdotool key Page_Down");
					}
					else{
						exec("xdotool key Page_Up");
					}
				}
				MainSend('speed='+tempspeed);
			break;
			case "font":
				MainSend('font='+parseInt(sockCom[1]));
			break;
			case "message":
				MainSend('message='+sockCom[1]);
			break;
			case "toggle":
				MainSend('toggle');
				if (fs.existsSync("Pres.pdf")){
					exec("xdotool key Escape");
				}
			break;
			case "reverse":
				MainSend('reverse');
				if (fs.existsSync("Pres.pdf")){
					exec("xdotool key Escape");
				}
			break;
			case "stop":
				MainSend('stop');
			break;
			case "refresh":
				MainSend('refresh');
			break;
			case "newtext":
				NewText(sockCom[1],"Scen.txt");
			break;
			case "newtex0":
				NewText(sockCom[1],"Scen1.txt");
			break;
			case "newtex1":
				NewText(sockCom[1],"Scen2.txt");
			break;
			case "newtex2":
				NewText(sockCom[1],"Scen3.txt");
			break;
			case "newtex3":
				NewText(sockCom[1],"Scen4.txt");
			break;
			case "newtex4":
				NewText(sockCom[1],"Scen5.txt");
			break;
			case "newtex5":
				NewText(sockCom[1],"Scen6.txt");
			break;
			case "newtex6":
				NewText(sockCom[1],"Scen7.txt");
			break;
			case "newtex7":
				NewText(sockCom[1],"Scen8.txt");
			break;
			case "newtex8":
				NewText(sockCom[1],"Scen9.txt");
			break;
			case "newtex9":
				NewText(sockCom[1],"Scen10.txt");
			break;
			case "newsett":
				NewText(sockCom[1],"Settings.txt");
			break;
			case "newnetw":
				NewText(sockCom[1],"Network.txt");
				setTimeout(function(){NewText("","NetLoad.txt")},3000);
			break;
			case "mirror":
				if (sockCom[1]=="1"){
					NewText("","Reverse.txt");
				}
				else{
					if (fs.existsSync("Reverse.txt")){try {fs.unlinkSync("Reverse.txt")} catch (err){}};
				}
			break;
			case "reboot":
				setTimeout(function(){NewText("","Reboot.txt")},1000);
			break;
			case "PdfDelete":
				if (fs.existsSync("Pres.pdf")){try {fs.unlinkSync("Pres.pdf")} catch (err){}};
			break;
			default:
		}
	});
	wsClient.on('close', function() {
		
	});
}

function MainSend(s){
	if (MainConected){
		wsCt.send(s);
	}
}

function NewText(s,f){
	fs.writeFileSync(f,s, function(err) {
		if(err) {
			return console.log(err);
		}
	});
	//MainSend('refresh');
}


function SubmitText(){
	//console.log("submittext");
	wsServer2.clients.forEach((client) => {
       submitsendText(client);
    });
}

function SubmitBase(){
	//console.log("submitbase");
	wsServer2.clients.forEach((client) => {
       submitsendBase(client);
    });
}

function SubmitCurrent(){
	//console.log("submitcurrent");
	wsServer2.clients.forEach((client) => {
       submitsendCurrent(client);
    });
}

function submitsendBase(wc){
	wc.send("font="+font);
	wc.send("fields="+fields);
	wc.send("scrollHeight="+scrollHeight);
	wc.send("clientWidth="+clientWidth);
	wc.send("initialfontoper="+initialfontoper);
	wc.send("clientHeight="+clientHeight);
	wc.send("innerWidth="+innerWidth);
	wc.send("initialtupdate="+initialtupdate);
}

function submitsendCurrent(wc){
	wc.send("scrollTop="+scrollTop);
	wc.send("speed="+speed);
	wc.send("promptState="+promptState);
}

function submitsendText(wc){
	wc.send("TEXT="+TEXT);
}
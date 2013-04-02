var http =  require("http");
var url = require("url");
var querystring=require("querystring");
var fs = require("fs");
var exec = require('child_process').exec,
    child;


http.createServer(function (request, response){
	var pathname = url.parse(request.url).pathname;

	var query = url.parse(request.url).query;
	console.log(query);
		query=querystring.parse(query);

	console.log(pathname);
	if (query['pass']=="jesuispassécu"){

	
			if (pathname=="/"){
			
			console.log("racine");	
			response.writeHead(200, {"Content-Type":"html"});
			response.write("<html><head><link href='style.css' rel='stylesheet'></head><body>")
			response.write("<h1>IRC Logs</h1>");
			
			var chans = getLogs();

			for (var chan in chans){
				response.write("<h2>"+chan+"</h2>");
				for (var year in chans[chan]){
					response.write("<h3>"+year+"</h3>");
					for (var month in chans[chan][year]){
						response.write("<h4>"+month+"</h4>");
						for (var day in chans[chan][year][month]){
							response.write("<a href='view?pass=jesuispassécu&file="+chans[chan][year][month][day]+"' >"+day+"</a>");
							response.write("<br/>");
						}
					}
				}
			}

			response.write("</body></html>")
			response.end();
			

			}
	
			else if (pathname=="/view"){
			
			fichier = new Buffer(query["file"], "base64").toString('utf8');
			var txt=fs.readFileSync("IRCLogs/"+fichier);
			response.writeHead(200,{"Content-type":"text/plain; charset=utf-8"});
			response.write(txt);
			response.end()


			}
	
	}else if (pathname=="/style.css"){

				var css= new fs.readFileSync("style.css");
				response.writeHead(200,{"Content-type":"text/css"});
				response.write(css);
				response.end();
			

			}

	response.writeHead(200,{"content-type":"text/html"});
	response.write("Connexion refusée !!");
	response.end();

	}).listen(8888);

console.log("Server has started");


function getLogs(){

	var files = fs.readdirSync("IRCLogs");
	var chans = new Array();
	
	files.forEach(function(file){
		
		var analyse = file.toString().split('.');
		var year = analyse[1].toString().slice(0,4);
		var month = analyse[1].toString().slice(5,7);
		var day = analyse[1].toString().slice(8,10);
		var chan = analyse[0].toString();

		if (!chans[chan]){
			chans[chan]= new Array();	
		}
		
		if (!chans[chan][year]){
			chans[chan][year]=new Array();
		}
		
		if (!chans[chan][year][month]){
			chans[chan][year][month]=new Array();
		}
		chans[chan][year][month][day]=new Buffer(file).toString("base64");
	});

	return chans;
}




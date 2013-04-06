var net= require("net"),
    port=6667,
    host="irc.larez.fr";
    fs = require("fs");

var chans;
var connecte=false;

var chanUsers = new Array();

//var keywords = keywords();

/*
 *Fonction permettant de rejoindre les chans indiqués dans le fichier chan.txt
 *
 * */

function joinChans(){

fs.readFile("chans.txt", function(err,data){

		if (err) throw err;
		var chans=data.toString().split("\n");
//		socket.write("\n");
		chans.forEach(function(chan){
			if (chan != ""){
				console.log("Connexion à "+chan+"Commande : "+"JOIN "+chan+"\n");
				chanUsers[chan]=new Array();
				socket.write("JOIN "+chan+" \n");
			}
		connecte=true;
		});
	
	});

}

function keywords(){

var keywords = ""; 
var file = fs.readFileSync("keywords.txt")

		var words = file.toString().split("\n");
		words.forEach(function(word){
			if (word != ""){
				keywords+=word+"|";
			//	console.log("key :"+word);
			}
		connecte=true;
		});

return keywords.slice(0,-1);

}


/*
 *
 *Fonction inscrivant le texte dans le fichier (ajout automatique de la date au nom de fichier)
 *
 * */

function log(file, txt){

	if (connecte){
		var dt = new Date()
		var hour = dt.getHours();
		var min = dt.getMinutes();
	
		if (hour<10){
			hour='0'+hour;
		}
	
		if (min<10){
			min='0'+min;
		}
	
		var time ="["+ hour +":"+min+"]"+" ";
	
		var jour=dt.getDate();
		var mois = dt.getMonth()+1;
	
		if (jour < 10 ){
			jour = '0'+jour;
		}
	
		if (mois < 10 ){
			mois='0'+mois;
		}
	
		var reg = new RegExp(".*(?:"+keywords()+").*","g");
		var find = txt.match(reg);

		if (find){
			find.forEach(function(msg){
				fs.appendFile("alert.txt",msg+"\n");	
				console.log("alerte : "+msg);
				
			});
		
		}



		fs.appendFile("IRCLogs/"+file+"."+dt.getFullYear()+"-"+mois+"-"+jour+".log",time+txt+"\n");
	}
}


var socket = net.createConnection(port, host);
		
		socket.on('connect', function(connect){
		console.log("Connexion établie !");
	});

	socket.on('error', function(error){
		console.log("Erreur !");
	});

	socket.on('end', function(){
		console.log("Fin de la connexion");
	});

	socket.on('data', function(data){
	
		console.log("D:"+data.toString());

		//On traite les différents évènements
	

		if (data.toString().search("Checking Ident")!=-1){ //Le serveur demande l'identification
			socket.write("NICK JSBot \n")
	       		socket.write("USER JSBot 8 * : TH3o_SMith JSBot \n");
			joinChans();

		}

		var multiple=data.toString().split("\n");

		multiple.forEach(function(data){
			

			console.log("A|"+data.toString().slice(0,-1)+"|D");
			var input = data.toString().slice(0,-1);
			
			var ircInput = input.split(":")[1];
			
	
	
			if (connecte && input.search("PING")!=-1){ // Le serveur nous enoie un PING
				var pong = input.replace(/PING (.*)/,"PONG :$1 \n")
				socket.write(pong);
			}
	
			if (input.search("PRIVMSG")!=-1){ // Quelqu'un poste un message
				var user  = ircInput.split("!")[0];		
				var chan  = ircInput.replace(/.*PRIVMSG\s(.*)\s/,"$1").toLowerCase();		
				var message = input.replace(/^:[^:]*:(.*)/,"$1");
	
				var message = message.replace(/^.ACTION.(.*)/,"* $1");
	
				log(chan,user+" : "+message);
			}
			
			if (data.toString().search("JOIN")!=-1){ // Quelqu'un se connecte
				var user  = ircInput.split("!")[0];		
				var chan  = input.replace(/.*JOIN\s:(.*)/,"$1").toLowerCase();
				log(chan, user+" s'est connecté");
				if (chanUsers[chan]){
					chanUsers[chan].push(user);
				}
			}
	
	
			if (data.toString().search("PART")!=-1){ //Quelqu'un se déconnecte
				var user  = ircInput.split("!")[0];		
				var chan  = input.replace(/.*PART\s(.*)\s.*/,"$1").toLowerCase();	
				var reason = input.replace(/:.*PART\s.*\s:(.*)/,"$1");
	
					log(chan, user+" s'est déconnecté ("+reason+")");
			}

			if (data.toString().search("QUIT")!=-1){ //Quelqu'un se déconnecte
				console.log("qui");
				var user  = ircInput.split("!")[0];		
				var reason = input.replace(/.*:Quit:\s(.*)/,"$1");

				console.log(chanUsers["#bot"].toString());

				for (var chan in chanUsers){
					console.log("kkk");
					chanUsers[chan].forEach(function(chanUser,index,ar){
						console.log(user+"****"+chanUser);
						if (user==chanUser){
							ar[index]="";
							log(chan, chanUser+" s'est déconnecté ("+reason+")");
						}	
						
					});	
					
					
					
				};
	
			}

			if (data.toString().search(/=\s#.*\:/)!=-1){ //On récupère la liste des gens sur un chan
				var chan  = ircInput.replace(/.*=\s(.*)\s.*/,"$1").toLowerCase();
				var usersString = input.split(":")[2];
				var users = usersString.slice(0,-1).split(" ");

				users.forEach(function(user){

					chanUsers[chan].push(user);
					console.log(chanUsers[chan].toString());	
				
				});




			}

			

	});
	});

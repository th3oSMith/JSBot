var nodemailer = require("nodemailer")

var send = function (txt){

var transport = nodemailer.createTransport("sendmail");


var mailOptions= {
	from:"JSBot <noreply@larez.fr>",
	to:"remi.robert@supelec.fr",
	subject:"Notification",
	text:txt}

transport.sendMail(mailOptions, function(error, response){
	if (error){
		console.log(error);
	}else{
		console.log("Message sent");
	}
});

transport.close();
}

exports.send = send;




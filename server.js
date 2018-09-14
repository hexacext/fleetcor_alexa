'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('alexa-app'),
    app = express(),
    alexaApp = new alexa.app("fleetcorassistant"),
    MongoClient = require('mongodb').MongoClient;
	
require('dotenv').config();

//create server to listen to port from the environment variable or 5000
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

/*MongoClient.connect(process.env.MONGODB_URL + process.env.MONGODB_NAME, function(err, db) {
	if (err) { 
		console.log("Error in getting connection ", err);
	} else {	  
		db.collection("fleetcor_user_card").find({"lastFour": "1234"}).toArray((error, result) => {
			if(error){
				console.log(error);
			} else {
				console.log(result);
			}
			db.close();
		});
	}
});*/

var blockCardIntentCalled = false;
var creditLimitIntentCalled = false;
var accountBalanceIntentCalled = false;
var cardNumber = "";

alexaApp.error = function (e, req, res) {
	console.log("Error in Alexa");
    console.log(e);
    console.log(req);
    throw e;
};

//Account linking card
alexaApp.accountLinkingCard = function () {
    var card = {
        type: "LinkAccount"
    }
    return card;
}

alexaApp.launch(async function (request, response) {
    console.log('Session Obj ' + JSON.stringify(request.getSession()));
    var say = [];
	//Check if the Access Token is there
	if (request.getSession().details.accessToken) {
		//Get user profile details like name & email
		await getUserDetails(request.getSession().details.accessToken).then((userDetails) => {
			//For email - userDetails.email
			say.push('<s>Hi ' + userDetails.name + ' </s>');
			say.push('<s>I am Fleetcor Assistant.<break strength="medium" />I can help you with managing your Fleetcards.<break strength="medium" />You may ask ‘What is my credit limit?’ or <break strength="medium" /> ‘What is my available balance?’.<break strength="medium" />You can stop the conversation anytime by saying end or stop</s>');   
			say.push('<s>What can I do for you <break strength="medium" /></s>'); 
			response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");			
			response.say(say.join('\n'));
			response.send();
		}).catch((error) => {
			console.log("Error in acc link ", error);
			response.say('<s>There was a problem with account linking.<break strength="medium" /> Try again later</s>');
			response.shouldEndSession(true);
			response.send();
		});
	} else {
		response.card(alexaApp.accountLinkingCard());
		response.say('<s>FleetCor Assistant requires you to link your Amazon account</s>');
		response.shouldEndSession(true);
	}
});

alexaApp.intent('blockCardIntent', function (request, response) {
    blockCardIntentCalled = true;
    var say=[];
    say = ["<s>Sure,<break strength=\"medium\" /> please provide the last 4 digits of the card you wish to block</s>"];
    response.shouldEndSession(false, "Tell me the last 4 digits of your card to be blocked");
    response.say(say.join('\n'));
});

alexaApp.intent('creditLimitIntent', function (request, response) {
    //creditLimitIntentCalled = true;
    var say=[];
     say = ["<s>You have a credit limit of <break strength=\"medium\" /> $250 in your card. <break strength=\"medium\" /> Is there anything I can help you with? </s>"];
    response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
    response.say(say.join('\n'));
});

alexaApp.intent('accountBalanceIntent', function (request, response) {
   // accountBalanceIntentCalled = true;
       var say=[];
     say = ["<s>You have a balance of <break strength=\"medium\" /> $100  in your account. <break strength=\"medium\" /> Is there anything I can help you with?</s>"];
    response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
    response.say(say.join('\n'));
});

alexaApp.intent('yesIntent', function (request, response) {
    // accountBalanceIntentCalled = true;
        var say=[];
        say = ["<s>Your card has been blocked successfully.<break strength=\"medium\" />Contact our help center to unblock it.<break strength=\"medium\" /> Is there anything I can help you with?</s>"];    
     response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
     response.say(say.join('\n'));
 });

 alexaApp.intent('noIntent', function (request, response) {
	var say = [];
    if(blockCardIntentCalled){
		say.push("<s>OK, Your card is not blocked<break strength=\"medium\" />Is there anything I can help you with?</s>");
	}
	response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
    response.say(say.join('\n'));
 });
 
alexaApp.intent('cardNumberIntent', function (request, response) {
    var say =['default response'];
    console.log(request.data.request.intent.slots.cardNumber.value)
    cardNumber=request.data.request.intent.slots.cardNumber.value;
    console.log('length 11');
	if(blockCardIntentCalled){
		console.log('Inside blockCardIntentCalled');
		say = ["<s> Are you sure that you want to block the card ending with <say-as interpret-as='ordinal'>"+cardNumber+" </say-as></s>"];
		console.log('after call',say);
		response.shouldEndSession(false, "Tell yes to block or no to not block the card");
		response.say(say.join('\n'));
	}
	else if(creditLimitIntentCalled){
		console.log("inside api call");
		say = ["<s>You have a credit limit of <break strength=\"medium\" /> $250 in your card </s>"];
		claimPaymentDetails = result;
		console.log('after call',say);
		response.shouldEndSession(false);
		response.say(say.join('\n'));
	}
	else if(accountBalanceIntentCalled){
		return helper.getRentalCarStatus(claimId).then((result) => {            
			say = result;
			console.log('after call',say);
			response.shouldEndSession(false);
			response.say(say.join('\n'));         
		}).catch((err)=>{
			say = ["<s> Something went wrong while processing your request.</s><s>Please try again</s>"];
			response.shouldEndSession(true);
			response.say(say.join('\n'));				
		})
	}
});

//To handle if user wants to end the conversation
alexaApp.intent('thankIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Happy to help you!</s> Good bye"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
});



//To get the profile details of user using the Access Token
function getUserDetails(accessToken){
	const request = require('request');	
	var amazonProfileURL = require('./config').amazonProfileURL + accessToken;
	return new Promise((resolve, reject) => {
		request(amazonProfileURL, function(error, response, body) {
			if (response.statusCode == 200) {
				var profile = JSON.parse(body);
				resolve(profile);
			} else {
				reject(error);
			}
		});
	});
}
'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('alexa-app'),
    app = express(),
    alexaApp = new alexa.app("fleetcorassistant"),
	db = require('./db');

//create server to listen to port from the environment variable or 5000
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//To connect the Alexa to express app
alexaApp.express({
    expressApp: app,
    checkCert: false
});

//Flag to set the identify the operation/query
var isblockCard = false;
var isExistingCard = false;
var isCreditLimit = false;
var isAccountBalance = false;
var lastFour = "";
var userId = '1';

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
    let say = [];
	//Check if the Access Token is there
	if (request.getSession().details.accessToken) {
		//Get user profile details like name & email
		await getUserDetails(request.getSession().details.accessToken).then((userDetails) => {
			//For email - userDetails.email
			say.push(`Hi ${userDetails.name}<break strength="medium" />
			I am Fleetcor Assistant.<break strength="medium" />I can help you with managing your Fleetcards.
			<break strength="medium" />You may ask ‘What is my credit limit?’ or <break strength="medium" /> ‘What is my available balance?’.
			<break strength="medium" />You can stop the conversation anytime by saying end <break strength="medium" /> or stop
			<break strength="medium" />What can I do for you today`);   
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
    isblockCard = true;
    let say = [];
	if(lastFour.trim() != ""){
		isExistingCard = true;
		say = [`Sure,<break strength=\"medium\" /> Do you want to block the card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as>`];
		response.shouldEndSession(false, `Tell me Yes <break strength=\"medium\" /> to block the card <say-as interpret-as='ordinal'> ${lastFour} </say-as>
		<break strength=\"medium\" />or No <break strength=\"medium\" /> to check for other card`);
		response.say(say.join('\n'));
	} else {
		isExistingCard = false;
		say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to block"];
		response.shouldEndSession(false, "Tell me the last 4 digits of your card to be blocked");
		response.say(say.join('\n'));
	}
});

alexaApp.intent('creditLimitIntent', function (request, response) {
    let say = [];
	say = ["<s>You have a credit limit of <break strength=\"medium\" /> $250 in your card. <break strength=\"medium\" /> Is there anything I can help you with? </s>"];
    response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
    response.say(say.join('\n'));
});

alexaApp.intent('accountBalanceIntent', function (request, response) {
	isAccountBalance = true;
	let say = [];
	if(lastFour.trim() != ""){
		isExistingCard = true;
		say = [`Sure,<break strength=\"medium\" /> Do you want to check the balance for card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as>`];
		response.shouldEndSession(false, `Tell me Yes <break strength=\"medium\" /> to block the card <say-as interpret-as='ordinal'> ${lastFour} </say-as>
		<break strength=\"medium\" />or No <break strength=\"medium\" /> to check for other card`);
		response.say(say.join('\n'));
	} else {
		isExistingCard = false;
		say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
		response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the balance");
		response.say(say.join('\n'));
	}
});

alexaApp.intent('yesIntent',async function (request, response) {
    var say = [];
	if(isblockCard){
		await db.blockCard(userId, lastFour).then(() => {
			lastFour = ""; //Once the card is blocked reset the value
			say = ["Your card has been blocked successfully <break strength=\"medium\" /> Is there anything I can help you with?"];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
			response.say(say.join('\n'));
		}).catch((error) => {
			say = [`I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
		//After completing the operation reset the flag
		isblockCard = false;
	} else if(isAccountBalance) {
		await db.getBalance(userId, lastFour).then((balance) => {			
			say = [`Available balance for the card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as> is $ ${balance}
			<break strength=\"medium\" />Is there anything I can help you with?`];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
			response.say(say.join('\n'));
		})
		.catch((error) => {
			say = [`I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
		//After completing the operation reset the flag
		isAccountBalance = false;
	}
 });

 alexaApp.intent('noIntent', function (request, response) {
	var say = [];
    if(isblockCard){
		if(isExistingCard){
			isExistingCard = false;
			say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to block"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to be blocked");
			response.say(say.join('\n'));			
		} else {
			//After completing the operation reset the flag
			isblockCard = false;
			say = ["OK, Your card will not be blocked <break strength=\"medium\" />Is there anything I can help you with?"];
		}
	} else if(isAccountBalance){
		if(isExistingCard){
			isExistingCard = false;
			say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the balance");
			response.say(say.join('\n'));	
		} else {
			//After completing the operation reset the flag
			isAccountBalance = false;
			say = ["OK, Your card will not be blocked <break strength=\"medium\" />Is there anything I can help you with?"];
		}
	}
	response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
    response.say(say.join('\n'));
 });
 
alexaApp.intent('cardNumberIntent', async function (request, response) {
    var say = [];
    console.log(request.data.request.intent.slots.cardNumber.value)
    lastFour = request.data.request.intent.slots.cardNumber.value;
    if(isblockCard){
		await db.checkIfCardExists(userId, lastFour).then((isAvailable) => {
			if(isAvailable){
				console.log('Inside blockCardIntentCalled');
				say = [`The card once blocked cannot be unblocked <break strength=\"medium\" /> it can only be re-issued <break strength=\"strong\" /> 
				Are you sure you want to block the card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as>`];
				response.shouldEndSession(false, "Say Yes to block <break strength=\"medium\" /> or No to not block the card");
				response.say(say.join('\n'));
			} else {
				//After completing the operation reset the flag
				isblockCard = false;
				say = [`Please check <break strength=\"medium\" /> There is no card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as>
				<break strength=\"medium\" />Is there anything I can help you with?`];
				response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
				response.say(say.join('\n'));
			}
		}).catch((error) => {
			say = [`I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
	} else if(isAccountBalance){
		await db.checkIfCardExists(userId, lastFour).then(async (isAvailable) => {
			if(isAvailable){
				await db.getBalance(userId, lastFour).then((balance) => {			
					say = [`Available balance for the card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as> is $ ${balance}
					<break strength=\"medium\" />Is there anything I can help you with?`];
					response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
					response.say(say.join('\n'));
				})
				.catch((error) => {
					say = [`I am not able to answer this at the moment. Please try again later`];
					response.shouldEndSession(true);
					response.say(say.join('\n'));
				});
				//After completing the operation reset the flag
				isAccountBalance = false;
			} else {
				//After completing the operation reset the flag
				isblockCard = false;
				say = [`Please check <break strength=\"medium\" /> There is no card ending with <say-as interpret-as='ordinal'> ${lastFour} </say-as>
				<break strength=\"medium\" />Is there anything I can help you with?`];
				response.shouldEndSession(false, "I can help you with credit limit, account balance or block your card");
				response.say(say.join('\n'));
			}
		}).catch((error) => {
			say = [`I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
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
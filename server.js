'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('alexa-app'),
    app = express(),
    alexaApp = new alexa.app("fleetcorassistant"),
	db = require('./db'),
	config = require('./config');

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
var isRecentTransactions = false;
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

//Welcome or start Intent
alexaApp.launch(async function (request, response) {
    //console.log('Session Obj ' + JSON.stringify(request.getSession()));
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
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");			
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

//To block the card
alexaApp.intent('blockCardIntent', async function (request, response) {
	console.log("Inside block Intent");
    isblockCard = true;
    let say = [];
	//Check if the last 4 digits is given in utterance
	if(request.data.request.intent.slots.lastFour.value){
		lastFour = request.data.request.intent.slots.lastFour.value;
		await handleQuery(say, response);
	} else {
		//Check if last 4 digits already stored
		if(lastFour.trim() != ""){
			isExistingCard = true;
			say = [`Sure,<break strength=\"medium\" /> Do you want to block the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
			response.shouldEndSession(false, `Tell me Yes <break strength=\"medium\" /> to block the card <say-as interpret-as='digits'> ${lastFour} </say-as>
			<break strength=\"medium\" />or No <break strength=\"medium\" /> to check for other card`);
			response.say(say.join('\n'));
		} else {
			//Get last 4 digits from user
			isExistingCard = false;
			say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to block"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to be blocked");
			response.say(say.join('\n'));
		}
	}
});

//To handle the credit limit queries
alexaApp.intent('creditLimitIntent', async function (request, response) {
	console.log("Inside CL Intent");
	isCreditLimit = true;
    let say = [];
	if(request.data.request.intent.slots.creditLimitNumber.value){
		lastFour = request.data.request.intent.slots.creditLimitNumber.value;
		await handleQuery(say, response);
	} else {
		if(lastFour.trim() != ""){
			isExistingCard = true;
			say = [`Sure,<break strength=\"medium\" /> Do you want to check the credit limit for card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
			response.shouldEndSession(false, `Tell me Yes <break strength=\"medium\" /> to block the card <say-as interpret-as='digits'> ${lastFour} </say-as>
			<break strength=\"medium\" />or No <break strength=\"medium\" /> to check for other card`);
			response.say(say.join('\n'));
		} else {
			isExistingCard = false;
			say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the credit limit");
			response.say(say.join('\n'));
		}
	}
});

//To handle the account balance queries
alexaApp.intent('accountBalanceIntent',async function (request, response) {
	console.log("Inside AB Intent ", lastFour);
	isAccountBalance = true;
	let say = [];
	console.log("BalanceNumber", request.data.request.intent.slots.balanceNumber.value);
	if(request.data.request.intent.slots.balanceNumber.value){		
		lastFour = request.data.request.intent.slots.balanceNumber.value;
		await handleQuery(say, response);
	} else {
		if(lastFour.trim() != ""){
			isExistingCard = true;
			say = [`Sure,<break strength=\"medium\" /> Do you want to check the balance for card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
			response.shouldEndSession(false, `Tell me Yes <break strength=\"medium\" /> to block the card <say-as interpret-as='digits'> ${lastFour} </say-as>
			<break strength=\"medium\" />or No <break strength=\"medium\" /> to check for other card`);
			response.say(say.join('\n'));
		} else {
			isExistingCard = false;
			say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the balance");
			response.say(say.join('\n'));
			
		}
	}
});

//To handle the recent transaction queries
alexaApp.intent('transactionsIntent', async function(request, response){
	console.log("Inside Trans Intent ");
	isRecentTransactions = true;
	let say = [];
	if(request.data.request.intent.slots.transactionNumber.value){
		lastFour = request.data.request.intent.slots.transactionNumber.value;
		await handleQuery(say, response);
	} else {
		if(lastFour.trim() != ""){
			isExistingCard = true;
			say = [`Sure,<break strength=\"medium\" /> Do you want to check the transactions for card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
			response.shouldEndSession(false, `Tell me Yes <break strength=\"medium\" /> to check the transactions <say-as interpret-as='digits'> ${lastFour} </say-as>
			<break strength=\"medium\" />or No <break strength=\"medium\" /> to check for other card`);
			response.say(say.join('\n'));
		} else {
			isExistingCard = false;
			say = ["Sure,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the transactions");
			response.say(say.join('\n'));
			
		}
	}
});

//To handle the user input - Yes
alexaApp.intent('yesIntent',async function (request, response) {
	console.log("Inside yes Intent");
    var say = [];
	if(isblockCard){
		await db.blockCard(userId, lastFour).then(() => {
			lastFour = ""; //Once the card is blocked reset the value
			say = ["Your card has been blocked successfully <break strength=\"medium\" /> Is there anything else I can help you with?"];
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
			say = [`Available balance for the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as> is $ ${balance}
			<break strength=\"medium\" />Is there anything else I can help you with?`];
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
	} else if(isCreditLimit) {
		await db.getCreditLimit(userId, lastFour).then((creditLimit) => {			
			say = [`Credit Limit for the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as> is $ ${creditLimit}
			<break strength=\"medium\" />Is there anything else I can help you with?`];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
			response.say(say.join('\n'));
		})
		.catch((error) => {
			say = [`I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
		//After completing the operation reset the flag
		isCreditLimit = false;
	} else if(isRecentTransactions){
		await db.getTransactions(userId, lastFour).then((transactionDetails) => {
			console.log("TransactionDetails ", transactionDetails.length);
			if(transactionDetails.length == 0){
				say = [`You don't have transactions in your card <break strength=\"medium\" /> You can use your fleetcard in any of the specified Merchant Location
				<break strength=\"medium\" /> Is there anything else I can help you with?`];
				response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
				response.say(say.join('\n'));
			} else {
				const moment = require('moment');
				say = [`You have the following transactions for the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
				for(var i=0;i<transactionDetails.length;i++){
					//console.log(moment(transactionDetails[i].transactionDate).format('Do MMMM YYYY, dddd'),moment(transactionDetails[i].transactionDate).format('h mm A'),transactionDetails[i].transactionAmount,transactionDetails[i].station);
					say.push(`<break strength="x-strong" /> On <say-as interpret-as="date" format="mdy"> ${moment(transactionDetails[i].transactionDate).format('MM/DD/YYYY')} </say-as> 
					${moment(transactionDetails[i].transactionDate).format('h mm A')} <break strength="medium" />
					you have spent $ ${transactionDetails[i].transactionAmount} <break strength="medium" /> at ${transactionDetails[i].station}`);
				}
				say.push(`<break time="1s" /> If you find any dispute in transaction <break strength=\"medium\" />
				Please contact us <say-as interpret-as="telephone">800-771-6075</say-as>
				<break strength=\"medium\" /> or mail us at <break strength=\"medium\" /> universalpremiummc@fleetcor.com `);
				say.push(`<break strength=\"medium\" />Is there anything else I can help you with?`);
				response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
				response.say(say.join('\n'));
			}
		})
		.catch((error) => {
			say = [`Sorry,<break strength=\"medium\" /> I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
	} else {
		let say = ["I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card"];
		response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
		response.say(say.join('\n'));
	}
 });

 //To handle the user input - No
 alexaApp.intent('noIntent', function (request, response) {
	 console.log("Inside no Intent");
	var say = [];
    if(isblockCard){
		if(isExistingCard){
			isExistingCard = false;
			say = ["OK,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to block"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to be blocked");			
		} else {
			//After completing the operation reset the flag
			isblockCard = false;
			say = ["OK, Your card will not be blocked <break strength=\"medium\" />Is there anything else I can help you with?"];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
		}
	} else if(isAccountBalance){
		if(isExistingCard){
			isExistingCard = false;
			say = ["OK,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the balance");
		} else {
			//After completing the operation reset the flag
			isAccountBalance = false;
			say = ["OK <break strength=\"medium\" /> Is there anything else I can help you with?"];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
		}
	} else if(isCreditLimit){
		if(isExistingCard){
			isExistingCard = false;
			say = ["OK,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the credit limit");
		} else {
			//After completing the operation reset the flag
			isCreditLimit = false;
			say = ["OK <break strength=\"medium\" /> Is there anything else I can help you with?"];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
		}
	} else if(isRecentTransactions){
		if(isExistingCard){
			isExistingCard = false;
			say = ["OK,<break strength=\"medium\" /> Please provide the last 4 digits of the card you wish to know"];
			response.shouldEndSession(false, "Tell me the last 4 digits of your card to check the credit limit");
		} else {
			//After completing the operation reset the flag
			isRecentTransactions = false;
			say = ["OK <break strength=\"medium\" /> Is there anything else I can help you with?"];
			response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
		}
	} else {
		say = [`ok <break strength=\"medium\" /> Happy to help you`];
		response.shouldEndSession(true);
	}
    response.say(say.join('\n'));
 });
 
 //To get the last 4 digits of the card Number
alexaApp.intent('cardNumberIntent', async function (request, response) {
	console.log("Inside CN Intent");
    var say = [];
    console.log(request.data.request.intent.slots.cardNumber.value)
    lastFour = request.data.request.intent.slots.cardNumber.value;
	await handleQuery(say, response);
});

alexaApp.intent('unblockCardIntent', function (request, response) {
	console.log("Inside unblock Intent");
    let say = [`Sorry <break strength=\"medium\" /> The card once blocked cannot be unblocked.<break strength=\"medium\" /> You will have to place request to reissue a new card.<break strength=\"medium\" /> Is there anything else I can help you with`];
    response.shouldEndSession(false, "");
    response.say(say.join('\n'));
});

alexaApp.intent('AMAZON.StopIntent', function (request, response) {
	isblockCard = false;
	isExistingCard = false;
	isCreditLimit = false;
	isAccountBalance = false;
	isRecentTransactions = false;
	console.log("Inside stop Intent");
    let say = ["Happy to help you! Good bye"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
});

alexaApp.intent('AMAZON.HelpIntent', function (request, response) {
	console.log("Inside help Intent");
    let say = ["I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card"];
    response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
    response.say(say.join('\n'));
});

alexaApp.intent('AMAZON.CancelIntent', function (request, response) {
	isblockCard = false;
	isExistingCard = false;
	isCreditLimit = false;
	isAccountBalance = false;
	isRecentTransactions = false;
	console.log("Inside cancel Intent");
    let say = ["Happy to help you! Good bye"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
});

//To handle if user wants to end the conversation
alexaApp.intent('thankIntent', function (request, response) {
	isblockCard = false;
	isExistingCard = false;
	isCreditLimit = false;
	isAccountBalance = false;
	isRecentTransactions = false;
	console.log("Inside thank Intent");
    var say =["<s> Happy to help you!</s><break strength=\"medium\" /> Good bye"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
});

alexaApp.intent('AMAZON.FallbackIntent', function (request, response) {
	console.log("Inside fallback Intent");
    var say =["Sorry,<break strength=\"medium\" />I am not able to understand.<break strength=\"medium\" />Is there anything else I can help you with"];
    response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
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
				console.log(profile);
				resolve(profile);
			} else {
				reject(error);
			}
		});
	});
}

//To handle the queries
async function handleQuery(say, response){
	if(isblockCard){
		await db.checkIfCardExists(userId, lastFour).then((isAvailable) => {
			if(isAvailable){
				console.log('Inside blockCardIntentCalled');
				say = [`The card once blocked cannot be unblocked <break strength=\"medium\" /> it can only be re-issued <break strength=\"x-strong\" /> 
				Are you sure <break strength=\"medium\" /> you want to block the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
				response.shouldEndSession(false, "Say Yes to block <break strength=\"medium\" /> or No to not block the card");
				response.say(say.join('\n'));
			} else {
				//After completing the operation reset the flag
				isblockCard = false;
				say = [`Please check <break strength=\"medium\" /> There is no card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>
				<break strength=\"medium\" />Is there anything else I can help you with?`];
				lastFour = "";
				console.log("lastFour ", lastFour);
				response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
				response.say(say.join('\n'));
			}
		}).catch((error) => {
			say = [`Sorry,<break strength=\"medium\" /> I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
	} else if(isAccountBalance){
		await db.checkIfCardExists(userId, lastFour).then(async (isAvailable) => {
			if(isAvailable){
				await db.getBalance(userId, lastFour).then((balance) => {			
					say = [`Available balance for the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as> is $ ${balance}
					<break strength=\"medium\" />Is there anything else I can help you with?`];
					response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
					response.say(say.join('\n'));
				})
				.catch((error) => {
					say = [`Sorry,<break strength=\"medium\" /> I am not able to answer this at the moment. Please try again later`];
					response.shouldEndSession(true);
					response.say(say.join('\n'));
				});
				//After completing the operation reset the flag
				isAccountBalance = false;
			} else {
				//After completing the operation reset the flag
				isAccountBalance = false;
				say = [`Please check <break strength=\"medium\" /> There is no card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>
				<break strength=\"medium\" />Is there anything else I can help you with?`];
				lastFour = "";
				console.log("lastFour - AB ", lastFour);
				response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
				response.say(say.join('\n'));
			}
		}).catch((error) => {
			say = [`Sorry,<break strength=\"medium\" /> I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
	} else if(isCreditLimit){
		await db.checkIfCardExists(userId, lastFour).then(async (isAvailable) => {
			if(isAvailable){
				await db.getCreditLimit(userId, lastFour).then((creditLimit) => {			
					say = [`Credit Limit for the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as> is $ ${creditLimit}
					<break strength=\"medium\" />Is there anything else I can help you with?`];
					response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
					response.say(say.join('\n'));
				})
				.catch((error) => {
					say = [`Sorry, <break strength=\"medium\" /> I am not able to answer this at the moment.<break strength=\"medium\" /> Please try again later`];
					response.shouldEndSession(true);
					response.say(say.join('\n'));
				});
				//After completing the operation reset the flag
				isCreditLimit = false;
			} else {
				//After completing the operation reset the flag
				isCreditLimit = false;				
				say = [`Please check <break strength=\"medium\" /> There is no card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>
				<break strength=\"medium\" />Is there anything else I can help you with?`];
				lastFour = "";
				console.log("lastFour - CL ", lastFour);
				response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
				response.say(say.join('\n'));
			}
		}).catch((error) => {
			say = [`Sorry, <break strength=\"medium\" /> I am not able to answer this at the moment.<break strength=\"medium\" /> Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
	} else if(isRecentTransactions){
		await db.checkIfCardExists(userId, lastFour).then(async (isAvailable) => {
			if(isAvailable){
				await db.getTransactions(userId, lastFour).then((transactionDetails) => {
					console.log("TransactionDetails ", transactionDetails.length);
					if(transactionDetails.length == 0){
						say = [`You don't have transactions in your card <break strength=\"medium\" /> You can use your fleetcard in any of the specified Merchant Location
						<break strength=\"medium\" /> Is there anything else I can help you with?`];
						response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
						response.say(say.join('\n'));
					} else {
						const moment = require('moment');
						say = [`You have the following transactions for the card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>`];
						for(var i=0;i<transactionDetails.length;i++){
							//console.log(moment(transactionDetails[i].transactionDate).format('Do MMMM YYYY, dddd'),moment(transactionDetails[i].transactionDate).format('h mm A'),transactionDetails[i].transactionAmount,transactionDetails[i].station);
							say.push(`<break strength="x-strong" /> On <say-as interpret-as="date" format="mdy"> ${moment(transactionDetails[i].transactionDate).format('MM/DD/YYYY')} </say-as> 
							${moment(transactionDetails[i].transactionDate).format('h mm A')} <break strength="medium" />
							you have spent $ ${transactionDetails[i].transactionAmount} <break strength="medium" /> at ${transactionDetails[i].station}`);
						}
						say.push(`<break time = "1s" /> If you find any dispute in transaction <break strength=\"medium\" />
						Please contact us <say-as interpret-as="telephone">800-771-6075</say-as>
						<break strength=\"medium\" /> or mail us at <break strength=\"medium\" /> universalpremiummc@fleetcor.com `);
						say.push(`<break strength=\"medium\" />Is there anything else I can help you with?`);
						response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
						response.say(say.join('\n'));
					}
				})
				.catch((error) => {
					say = [`Sorry,<break strength=\"medium\" /> I am not able to answer this at the moment. Please try again later`];
					response.shouldEndSession(true);
					response.say(say.join('\n'));
				});
				//After completing the operation reset the flag
				isRecentTransactions = false;
			} else {
				//After completing the operation reset the flag
				isRecentTransactions = false;
				say = [`Please check <break strength=\"medium\" /> There is no card ending with <say-as interpret-as='digits'> ${lastFour} </say-as>
				<break strength=\"medium\" />Is there anything else I can help you with?`];
				lastFour = "";
				response.shouldEndSession(false, "I can help you with credit limit,<break strength=\"medium\" /> account balance <break strength=\"medium\" /> or block your card");
				response.say(say.join('\n'));
			}
		}).catch((error) => {
			say = [`Sorry,<break strength=\"medium\" /> I am not able to answer this at the moment. Please try again later`];
			response.shouldEndSession(true);
			response.say(say.join('\n'));
		});
	}
}
'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('alexa-app'),
    app = express(),
    alexaApp = new alexa.app("fleetcorassistant"),
    helper = require('./helper');

alexaApp.express({
    expressApp: app,
    checkCert: false
});

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
//Simple card
alexaApp.card = function (current) {
    console.log('createCard: current=', current);
    var card = {
        type: 'Simple',
        title: 'Card'
    };
    
    card.content = content;
    return card;
};

//Standard card
alexaApp.standardCard = function () {
    var card = {
        type: 'Standard',
        title: 'Card',
        text: 'Sample Text \n Line2',
        image: {
            smallImageUrl: 'https://cdn3.iconfinder.com/data/icons/phones-set-2/512/27-512.png',
            largeImageUrl: 'https://cdn3.iconfinder.com/data/icons/phones-set-2/512/27-512.png'
        }
    };
    return card;
};

//Account linking card
alexaApp.accountLinkingCard = function () {
    var card = {
        type: "LinkAccount"
    }
    return card;
}

alexaApp.launch(async function (request, response) {
    console.log('launch ' + JSON.stringify(request));
    console.log('Session Obj ' + JSON.stringify(request.getSession()));
    console.log('Session Obj is new ' + request.getSession().isNew());
    //locale = request.data.request.locale;
    var say = [];
	//Check if the Access Token is there
	if (request.getSession().details.accessToken) {
		//Get user profile details like name & email
		await getUserDetails(request.getSession().details.accessToken).then((userDetails) => {
			//For email - userDetails.email
			say.push('<s>Hi ' + userDetails.name + ' </s>');
			say.push('<s>Welcome to FleetCor Assistant. <break strength="medium" /></s>');   
			say.push('<s>What can I do for you <break strength="medium" /></s>'); 
			response.shouldEndSession(false);			
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
    //say = ["<s>Sure,<break strength=\"medium\" /> Your card has been blocked successfully.<break strength=\"medium\" />Contact our help center to unblock it</s>"];    
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('creditLimitIntent', function (request, response) {
    //creditLimitIntentCalled = true;
    var say=[];
     say = ["<s>You have a credit limit of <break strength=\"medium\" /> $250 in your card </s>"];
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('accountBalanceIntent', function (request, response) {
   // accountBalanceIntentCalled = true;
       var say=[];
     say = ["<s>You have a balance of <break strength=\"medium\" /> $100  in your account</s>"];
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('confirmBlockIntent', function (request, response) {
    // accountBalanceIntentCalled = true;
        var say=[];
        say = ["<s>Your card has been blocked successfully.<break strength=\"medium\" />Contact our help center to unblock it</s>"];    
     response.shouldEndSession(false);
     response.say(say.join('\n'));
 });
alexaApp.intent('cardNumberIntent', function (request, response) {
    
    var say =['default response'];
    console.log(request.data.request.intent.slots.cardNumber.value)
    cardNumber=request.data.request.intent.slots.cardNumber.value;
    //if(claimId.length==11){
        console.log('length 11');
        /*claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
        console.log('After change::',claimId);*/
        if(blockCardIntentCalled){
            console.log('Inside blockCardIntentCalled');
            //return helper.getClaimStatus(claimId).then((result)=>{
                say = ["<s> Are you sure that you want to block the card ending with <say-as interpret-as='ordinal'>"+cardNumber+" </say-as></s>"];
                console.log('after call',say);
                response.shouldEndSession(false);
                response.say(say.join('\n'));

            // }).catch((err)=>{
            //     say = ["<s> Something went wrong while processing your request.</s><s>Please try again</s>"];
            //     response.shouldEndSession(true);
            //     response.say(say.join('\n'));				
            // })
        }
        else if(creditLimitIntentCalled){
            console.log("inside api call");
           // return helper.getClaimPaymentDetails(claimId).then((result)=>{            
                say = ["<s>You have a credit limit of <break strength=\"medium\" /> $250 in your card </s>"];
                claimPaymentDetails = result;
                console.log('after call',say);
                response.shouldEndSession(false);
                response.say(say.join('\n'));         
            // }).catch((err)=>{
            //     say = ["<s> Something went wrong while processing your request.</s><s>Please try again</s>"];
            //     response.shouldEndSession(true);
            //     response.say(say.join('\n'));				
            // })
            // console.log(say);
        }
        else if(accountBalanceIntentCalled){
            return helper.getRentalCarStatus(claimId).then((result)=>{            
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
    /*}
    else{
        console.log('length not 11');
        say=['<s>please enter the complete claim number</s>'];
        response.shouldEndSession(false);
        response.say(say.join('\n'));
    }*/
    
});

/*
alexaApp.intent('GermanClaimStatusIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    claimStatusIntentCalled = true;
    console.log(request.data.request.intent.slots)
    var say=[];
    
    if (request.data.request.intent.slots.claimId.value){
        claimId=request.data.request.intent.slots.claimId.value;
        console.log('claimId:'+claimId);
        claimIdPresent = true;
        claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
        return helper.getClaimStatusGerman(claimId).then((result)=>{
            say = result;
            console.log('after call',say);
            response.shouldEndSession(false);
            response.say(say.join('\n'));

        }).catch((err)=>{
            say = ["<s> Bei der Bearbeitung Ihrer Anfrage ist ein Fehler aufgetreten.</s><s>Bitte versuche es erneut</s>"];
            response.shouldEndSession(true);
            response.say(say.join('\n'));				
        })
    }
    else{
     say = ["<s>Bitte geben Sie die Anspruchsnummer an. <break strength=\"medium\" /></s>"];
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});



alexaApp.intent('GermanClaimIdIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =[];
    console.log(request.data.request.intent.slots.claimId.value)
    claimId=request.data.request.intent.slots.claimId.value;
    claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
    if(claimStatusIntentCalled){
        return helper.getClaimStatusGerman(claimId).then((result)=>{
            say = result;
            console.log('after call',say);
            response.shouldEndSession(false);
            response.say(say.join('\n'));

        }).catch((err)=>{
            say = ["<s> Bei der Bearbeitung Ihrer Anfrage ist ein Fehler aufgetreten.</s><s>Bitte versuche es erneut</s>"];
            response.shouldEndSession(true);
            response.say(say.join('\n'));				
        })
    }
    /*if(repairPaymentIntentCalled){
        getRepairPaymentStatus(claimId,function(responseText){
            say = responseText;
        });
    }
    if(rentalCarIntentCalled){
        getRentalCarStatus(claimId,function(responseText){
            say = responseText;
        });
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));//*
});

alexaApp.intent('rentalConfirmIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say = ["<s> As per your policy, you are eligible for 30 days rental car service not exceeding $35 a day.</s>"];
    say.push('<s> Can you let me know the start date of the rental car service?</s>');
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('rentalCancelIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Okay,But you can book a rental car later!</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
    resetAll();
});

alexaApp.intent('rentalDetailsIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =[];
    console.log(request.data.request.intent.slots);
    if (request.data.request.intent.slots.startDate.value && rentalStartDate =='' ){
        rentalStartDate = request.data.request.intent.slots.startDate.value;
        console.log(rentalStartDate);
        say =["<s> Can you tell me for how many days you would require the rental car service?</s>"];
    }
    if(rentalStartDate==''){
        say =["<s> Can you let me know the start date of the rental car service?</s>"];
    }
    if(request.data.request.intent.slots.days.value && rentalDays ==''){
        rentalDays = request.data.request.intent.slots.days.value;
        return helper.getRentalConfirmation(claimId,rentalStartDate,rentalDays).then((result)=>{            
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
    if(rentalDays==''){
        say =["<s> Can you tell me for how many days you would require the rental car service?</s>"];
    }
   // var say =["<s> Happy to help you!</s>"];
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});*/

alexaApp.intent('thankIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Happy to help you!</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
});


if (process.argv.length > 2) {
    var arg = process.argv[2];
    if (arg === '-s' || arg === '--schema') {
        console.log(alexaApp.schema());
    }
    if (arg === '-u' || arg === '--utterances') {
        console.log(alexaApp.utterances());
    }
}
const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
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
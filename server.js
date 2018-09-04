'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('alexa-app'),
    app = express(),
    alexaApp = new alexa.app("claim"),
    helper = require('./helper')

alexaApp.express({
    expressApp: app,
    checkCert: false
});

alexaApp.error = function (e, req, res) {
	console.log("Error in Alexa");
    console.log(e);
    console.log(req);
    throw e;
};
var claimStatusIntentCalled = false;
var rentalCarIntentCalled = false;
var repairPaymentIntentCalled = false;
var claimIdPresent = false;
var rentalStartDate = '';
var rentalDays = '';
var claimId = '';
var locale = '';
var claimPaymentDetails = {};

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


alexaApp.launch(function (request, response) {
    console.log('launch ' + JSON.stringify(request));
    console.log('Session Obj ' + JSON.stringify(request.getSession()));
    console.log('Session Obj is new ' + request.getSession().isNew());
    locale = request.data.request.locale;
    var say = [];
    if(locale == 'de-DE'){
        if (request.getSession().isNew()) {
            claimStatusIntentCalled = false;
            rentalCarIntentCalled = false;
            repairPaymentIntentCalled = false;
            claimIdPresent = false;
            rentalStartDate = '';
            rentalDays = '';
            claimId = '';
                        say.push('<s>Hallo</s>');
                        say.push('<s>Willkommen bei Claim Assistent. <break strength="medium" /></s>');   
                        say.push('<s>Was kann ich für Dich tun <break strength="medium" /></s>');  
                        response.shouldEndSession(false);
                        response.say(say.join('\n'));
                        response.send();
                    
        } else {
            console.log('----Access Token not available----');
           // response.say('<s>Node Saga requires you to link your google account.</s>');
        }
    }
    if(locale == 'en-US'){
        if (request.getSession().isNew()) {
            claimStatusIntentCalled = false;
            rentalCarIntentCalled = false;
            repairPaymentIntentCalled = false;
            claimIdPresent = false;
            rentalStartDate = '';
            rentalDays = '';
            claimId = '';
            claimPaymentDetails = {};
                        say.push('<s>Hi</s>');
                        say.push('<s>Welcome to Claim Assistant. <break strength="medium" /></s>');   
                        say.push('<s>What can I do for you <break strength="medium" /></s>');  
                        response.shouldEndSession(false);
                        response.say(say.join('\n'));
                        response.send();
                    
        } else {
            console.log('----Access Token not available----');
           // response.say('<s>Node Saga requires you to link your google account.</s>');
        }
    }
    
});

alexaApp.intent('claimStatusIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    claimStatusIntentCalled = true;
    console.log(request.data.request.intent.slots)
    var say=[];    
    if (request.data.request.intent.slots.claimId.value){
        claimId=request.data.request.intent.slots.claimId.value;
        console.log('claimId:'+claimId);
        if(claimId.length==11){
            claimIdPresent = true;
            claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
            return helper.getClaimStatus(claimId).then((result)=>{
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
        else{
            say=['<s>please enter the complete claim number</s>'];
            response.shouldEndSession(false);
            response.say(say.join('\n'));
        } 
    }
    else{
     say = ["<s>Please provide the claim number. <break strength=\"medium\" /></s>"];
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('repairPaymentIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');   

    repairPaymentIntentCalled = true;
    console.log('inside repairPaymentIntent');
    console.log(request.data.request.intent.slots)
    var say=[];
    console.log(request.data.request.intent.slots.claimId.value);
    if (request.data.request.intent.slots.claimId.value){
        claimId=request.data.request.intent.slots.claimId.value;
        console.log('claimId:'+claimId);
        if(claimId.length==11){
            claimIdPresent = true;
            claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
            
            return helper.getClaimPaymentDetails(claimId).then((result)=>{            
                say = "The payment status is "+result.paymentStatus;
                claimPaymentDetails = result;           
            }).catch((err)=>{
                say = err;				
            })
            
            console.log(say);
        }
        else{
            say=['<s>please enter the complete claim number</s>'];
            response.shouldEndSession(false);
            response.say(say.join('\n'));
        } 
    }
    else{
     say = ["<s>Please provide the claim number. <break strength=\"medium\" /></s>"];
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('rentalCarIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    rentalCarIntentCalled = true;
    console.log('inside rentalCarIntent');
    console.log(request.data.request.intent.slots)
    var say=[];
    
    if (request.data.request.intent.slots.claimId.value){
        claimId=request.data.request.intent.slots.claimId.value;
        console.log('claimId:'+claimId);
        if(claimId.length==11){
            claimIdPresent = true;
            claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
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
            console.log(say);
        }
        else{
            say=['<s>please enter the complete claim number</s>'];
            response.shouldEndSession(false);
            response.say(say.join('\n'));
        }        
    }
    else{
     say = ["<s>Please provide the claim number. <break strength=\"medium\" /></s>"];
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('claimIdIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =['default response'];
    console.log(request.data.request.intent.slots.claimId.value)
    claimId=request.data.request.intent.slots.claimId.value;
    console.log("claim id type"+typeof claimId.length);
    if(claimId.length==11){
        console.log('length 11');
        claimId = (claimId.replace(/(\d{3})(\d{2})(\d{6})/, "$1-$2-$3"));
        console.log('After change::',claimId);
        if(claimStatusIntentCalled){
            console.log('Inside claimStatusIntentCalled');
            return helper.getClaimStatus(claimId).then((result)=>{
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
        else if(repairPaymentIntentCalled){
            console.log("inside api call");
            return helper.getClaimPaymentDetails(claimId).then((result)=>{            
                say = ["<s> The payment status is "+result.paymentStatus+"</s>"];
                claimPaymentDetails = result;
                console.log('after call',say);
                response.shouldEndSession(false);
                response.say(say.join('\n'));         
            }).catch((err)=>{
                say = ["<s> Something went wrong while processing your request.</s><s>Please try again</s>"];
                response.shouldEndSession(true);
                response.say(say.join('\n'));				
            })
            console.log(say);
        }
        else if(rentalCarIntentCalled){
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
    }
    else{
        console.log('length not 11');
        say=['<s>please enter the complete claim number</s>'];
        response.shouldEndSession(false);
        response.say(say.join('\n'));
    }
    
});


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
    response.say(say.join('\n'));*/
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
});

alexaApp.intent('GermanWelcomeIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Willkommen beim Politikassistenten.</s><s>Was kann ich für Dich tun</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
    resetAll();
});

alexaApp.intent('thankIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Happy to help you!</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
    resetAll();
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

function getRepairPaymentDetailsMessage(callback){
    say.push('<s>The amount of $'+result.totalPayments.amount+' is credited to your bank account number <break strength=\"medium\" /> <say-as interpret-as="spell-out">'+result.bankAccountNumber+'</say-as> </s>');
    say.push('<s>on '+result.paymentDate+'.</s>');
    callback (say);
}

/*function getRentalCarStatus(claimId,callback){
    var say = ["<s> The Rental car has not been booked yet as the option was not selected when the claim was created.</s>"];
    say.push('<s> <break strength=\"medium\" /> Do you want to book one? </s>');
    callback (say);
}

function getRentalConfirmation(startDate,callback){
    console.log('In function'+startDate);
    var say = ["<s> Give me a moment and I shall revert with booking details.<break time='2s'/>  </s>"];
    say.push('<s> The car has been booked with the Rental agency <break strength=\"medium\" /> “Enterprise” and the reservation number is <say-as interpret-as=\"spell-out\">AB0963829</say-as>. </s>');
    say.push('<s> The car will be delivered on<break strength=\"medium\" />');
    say.push('April 5, 9AM.</s>');    
    callback (say);
}*/

function resetAll(){
    claimStatusIntentCalled = false;
    rentalCarIntentCalled = false;
    repairPaymentIntentCalled = false;
    claimIdPresent = false;
    rentalStartDate = '';
    rentalDays = '';
    claimId = '';
    locale = '';
    claimPaymentDetails = {};
}

alexaApp.intent('repairPaymentDetailsIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say = [];
    console.log(claimPaymentDetails);
    console.log(repairPaymentIntentCalled);
    if(claimIdPresent && (Object.keys(claimPaymentDetails).length !== 0) && repairPaymentIntentCalled && 
        (claimPaymentDetails.paymentStatus === "Issued" || claimPaymentDetails.paymentStatus === "Cleared")) {
        say = getRepairPaymentDetailsMessage();
    } else {
        var say = ["<s>Since the payment status is "+claimPaymentDetails.paymentStatus+", we are unavailable to provide the details. Please try something else.</s>"];
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
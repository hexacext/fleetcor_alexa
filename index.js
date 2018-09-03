'use strict';
const Alexa = require('alexa-sdk');
const helper = require('./helper');
const config = require('./config');

var locale = '';
var TourPackageIntentInvoked = false;
var destination ='';
var travelMonth = '';
var tripLength = '';
var priceRange = '';


const handler = {
    'LaunchRequest': function () {
        console.log("Locale: " + this.event.request.locale);
        locale = this.event.request.locale;
        console.log("Is new session: " + this.event.session.new);
        if (this.event.session.new) {
            this.resetAll;
        }
        this.emit(':ask', '<s>Hi!</s><s> Welcome to Trafalgar</s><s>What can I do for you</s>');
    },
    'AMAZON.HelpIntent': function () {
        this.response.speak('<s>What can I do for you</s>').listen('<s>What can I do for you</s>');
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('<s>Cancelled</s>');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('<s>Stopped</s>').shouldEndSession(true);
        this.emit(':responseReady');
    },
    "TourPackageIntent": function () {
        TourPackageIntentInvoked = true;
        var speechOutput = '<s>Sure,<break strength=\"medium\" /> May I know where are you travelling to?</s>';        
        this.response.speak(speechOutput).shouldEndSession(false);
        this.emit(':responseReady');
    },
    "DestinationIntent": function () {
        var speechOutput;
        destination = this.event.request.intent.slots.destination.value;
        var speechOutput = '<s>Which is your month of travel?</s>';
        console.log("destination is"+destination+"  Speech output: " + speechOutput);
        this.response.speak(speechOutput).shouldEndSession(false);
        this.emit(':responseReady');
    },
    "TravelMonthIntent": function () {
        var speechOutput;
        travelMonth = this.event.request.intent.slots.travelMonth.value;
        var speechOutput = '<s>Please share length of trip</s>';
        speechOutput += '<s><break strength=\"medium\" /> 1 to 7 days</s>';
        speechOutput += '<s><break strength=\"medium\" /> 8 to 14 days</s>';
        speechOutput += '<s><break strength=\"medium\" /> more than 14 days</s>';
        console.log("travelMonth is"+travelMonth+"  Speech output: " + speechOutput);
        this.response.speak(speechOutput).shouldEndSession(false);
        this.emit(':responseReady');
    },
    "TripLengthIntent": function () {
        var speechOutput;
        tripLength = this.event.request.intent.slots.tripLength.value;
        var speechOutput = '<s>Please share per person price range for package for the trip?</s>';        
        console.log("tripLength is"+tripLength+"  Speech output: " + speechOutput);
        this.response.speak(speechOutput).shouldEndSession(false);
        this.emit(':responseReady');
    },
    "PriceRangeIntent": function () {
        var speechOutput;
        priceRange = this.event.request.intent.slots.priceRange.value;
        var speechOutput = '<s>There are 12 packages available in that price range.</s><s>Shall I send the details to your email ID?</s>';        
        console.log("priceRange is"+priceRange+"  Speech output: " + speechOutput);
        this.response.speak(speechOutput).shouldEndSession(false);
        this.emit(':responseReady');
    },
    "EmailConfirmIntent": function () {
        var speechOutput;
       // return helper.sendTourPackageEmail().then((result) => {
            speechOutput = '<s>Email sent</s><s>Glad to be of help!</s>';
        /*}).catch((err) => {
            speechOutput = err;
        });*/
        this.response.speak(speechOutput).shouldEndSession(true);
        this.emit(':responseReady');
    },
    
    "EmailCancelIntent": function () {
        var speechOutput;
       // return helper.sendTourPackageEmail().then((result) => {
            speechOutput = '<s>Okay</s><s>You can get it later!</s>';
        /*}).catch((err) => {
            speechOutput = err;
        });*/
        this.response.speak(speechOutput).shouldEndSession(true);
        this.emit(':responseReady');
    },
    "thankIntent": function () {
        this.resetAll();
        var speechOutput = "<s> Happy to help you!.</s>";
        this.response.speak(speechOutput).shouldEndSession(true);
        this.emit(':responseReady');
    },
    "resetAll": function () {
        var locale = '';
        var TourPackageIntentInvoked = false;
        var destination ='';
        var travelMonth = '';
        var tripLength = '';
        var priceRange = '';
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = config.APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handler);
    alexa.execute();
};
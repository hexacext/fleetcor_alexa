const request = require('request'),
    config = require('./config');

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

module.exports = {
    "getClaimStatus": function (claimId) {
        var speechOutput = [];
        console.log('InsideHelper Claim Id:', claimId);
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'POST',
                url: config.claimStatusApiURL,
                headers: { 'cache-control': 'no-cache', authorization: 'Basic c3U6Z3c=', 'content-type': 'application/json' },
                body: { jsonrpc: '2.0', method: 'getClaimSummary', params: [claimId] },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    speechOutput = ["<s>Something went wrong.</s><s> Please try again</s>"];
                    resolve(speechOutput);
                } else {
                    if (body.error) {
                        console.log('Inside body error', body.error.message);
                        if (body.error.message == 'No Claim entity found')
                            speechOutput = ['<s>The claim number is not found.</s><s>Please enter a valid one</s>'];
                    } else {
                        speechOutput = ["<s>According to our records, the current status of claim with ID <break strength=\"medium\" /> <say-as interpret-as=\"digits\"> " + claimId + " </say-as>, is " + body.result.currentClaimStatus + ".</s>"];
                        if (body.result.currentClaimStatus === "On Hold") {
                            speechOutput.push('<s>The reason for the same is <break strength=\"medium\" />' + body.result.reason + '.</s>');
                        }
                    }
                    console.log(speechOutput);
                    resolve(speechOutput);
                }
            });
        })
    },
    "getClaimPaymentDetails": function (claimId) {
        console.log('inside getClaimPaymentDetails');
        var speechOutput = [];
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'POST',
                url: config.claimStatusApiURL,
                headers: { authorization: 'Basic c3U6Z3c=', 'content-type': 'application/json' },
                body: { jsonrpc: '2.0', method: 'getClaimPaymentDetails', params: [claimId] },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    speechOutput = ["<s>Something went wrong.</s><s> Please try again</s>"];
                    resolve(speechOutput);
                }
                console.log(body);
                resolve(body.result);
            });
        });
    },
    "getRentalCarStatus": function (claimId) {
        var speechOutput = [];
        console.log('InsideHelper Claim Id:', claimId);
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'POST',
                url: config.claimStatusApiURL,
                headers: { 'cache-control': 'no-cache', authorization: 'Basic c3U6Z3c=', 'content-type': 'application/json' },
                body: { jsonrpc: '2.0', method: 'rentalCarBookingStatus', params: [claimId] },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    speechOutput = ["<s>Something went wrong.</s><s> Please try again</s>"];
                    resolve(speechOutput);
                } else {
                    if (body.error) {
                        console.log('Inside body error', body.error.message);
                        if (body.error.message == 'No Claim entity found')
                            speechOutput = ['<s>The claim number is not found.</s><s>Please enter a valid one</s>'];
                    } else {
                        if (body.result.bookingStatus) {
                            var rentStartDate = new Date(body.result.bookingStartDate);
                            console.log('rentstartdate', rentStartDate);
                            var month = months[rentStartDate.getMonth()];
                            speechOutput = ['<s> The car has been booked with the Rental agency <break strength=\"medium\" /> ' + body.result.agency + ' <break time="200ms"/> and the reservation number is <break time="200ms"/> <say-as interpret-as=\"spell-out\">' + body.result.reservationID + '</say-as>. </s>'];
                            speechOutput.push('<s> The car will be delivered on ' + month + '<say-as interpret-as="ordinal">' + rentStartDate.getDate() + '</say-as> at <break time="150ms"/> 9AM</s>');
                        }
                        else {
                            speechOutput = ['<s> The Rental car has not been booked yet as the option was not selected when the claim was created.</s>'];
                            speechOutput.push('<s> <break strength=\"medium\" /> Do you want to book one? </s>');
                        }
                    }
                    console.log(speechOutput);
                    resolve(speechOutput);
                }
            });
        })
    },
    "getRentalConfirmation": function (claimId, rentalStartDate, rentalDays) {
        var speechOutput = [];
        return new Promise(function (resolve, reject) {
            rentalDays = rentalDays.match(/\d+/)[0];
            var startDate = new Date(rentalStartDate);
            rentalStartDate = startDate.getDate() + '/' + (startDate.getMonth()+1) + '/' + startDate.getFullYear();
            console.log('Claim Id', claimId);
            console.log('rentalstartDate', rentalStartDate);
            console.log('RentalDays', rentalDays);
            var options = {
                method: 'POST',
                url: config.claimStatusApiURL,
                headers: { 'cache-control': 'no-cache', authorization: 'Basic c3U6Z3c=', 'content-type': 'application/json' },
                body: { jsonrpc: '2.0', method: 'rentalCarBookingRequest', params: [claimId, rentalStartDate, rentalDays] },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    speechOutput = ["<s>Something went wrong.</s><s> Please try again</s>"];
                    resolve(speechOutput);
                } else {
                    if (body.error) {
                        console.log('Inside body error', body.error.message);
                        if (body.error.message == 'No Claim entity found')
                            speechOutput = ['<s>The claim number is not found.</s><s>Please enter a valid one</s>'];
                    } else {
                        console.log(body);
                            var rentStartDate = new Date(body.result.bookingStartDate);
                            console.log('rentstartdate', rentStartDate);
                            var month = months[rentStartDate.getMonth()];
                            speechOutput = ['<s> Let me help with your booking.<break time="2s"/>  </s>'];
                            speechOutput.push('<s> The car has been booked with the Rental agency <break strength=\"medium\" /> ' + body.result.agency + ' <break time="200ms"/> and the reservation number is <break time="200ms"/> <say-as interpret-as=\"spell-out\">' + body.result.reservationID + '</say-as>. </s>');
                            speechOutput.push('<s> The car will be delivered on ' + month + '<say-as interpret-as="ordinal">' + rentStartDate.getDate() + '</say-as> at <break time="150ms"/> 9AM</s>');
                       
                    }
                    console.log(speechOutput);
                    resolve(speechOutput);
                }
            });
        })
    },
    "getClaimStatusGerman": function (claimId) {
        var speechOutput = [];
        console.log('InsideHelper Claim Id:', claimId);
        return new Promise(function (resolve, reject) {
            var options = {
                method: 'POST',
                url: config.claimStatusApiURL,
                headers: { 'cache-control': 'no-cache', authorization: 'Basic c3U6Z3c=', 'content-type': 'application/json' },
                body: { jsonrpc: '2.0', method: 'getClaimSummary', params: [claimId] },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    console.log(error);
                    speechOutput = ["<s>Etwas ist schief gelaufen.</s><s> Bitte versuche es erneut</s>"];
                    resolve(speechOutput);
                } else {
                    if (body.error) {
                        console.log('Inside body error', body.error.message);
                        if (body.error.message == 'No Claim entity found')
                            speechOutput = ['<s>Die Anspruchsnummer wird nicht gefunden.</s><s>Bitte geben Sie einen gültigen ein</s>'];
                    } else {                        
                        if (body.result.currentClaimStatus === "On Hold") {
                            speechOutput = ["<s>Nach unseren Aufzeichnungen, der aktuelle Status des Anspruchs mit ID <break strength=\"medium\" /> <say-as interpret-as=\"digits\"> " + claimId + " </say-as>, in Wartestellung.</s>"];
                           //speechOutput.push('<s>The reason for the same is <break strength=\"medium\" />' + body.result.reason + '.</s>');
                        }
                        if (body.result.currentClaimStatus === "Processed") {
                            speechOutput = ["<s>Nach unseren Aufzeichnungen, der aktuelle Status des Anspruchs mit ID <break strength=\"medium\" /> <say-as interpret-as=\"digits\"> " + claimId + " </say-as>,wird verarbeitet.</s>"];
                           //speechOutput.push('<s>The reason for the same is <break strength=\"medium\" />' + body.result.reason + '.</s>');
                        }
                    }
                    console.log(speechOutput);
                    resolve(speechOutput);
                }
            });
        })
    }
};


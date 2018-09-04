const express = require('express'),
Alexa = require('alexa-app'),
bodyParser = require('body-parser'),
request = require('request');
helper = require('./helper')
//config = require('./config')

const app = express();
app.use(bodyParser.json());
CA = new Alexa.app('claimassistant');

var claimStatusIntentCalled = false;
var InsuranceDetailsIntentCalled = false;
var ClaimNumberPresent = false;
var claimId = "";
var resp_msg = "";

app.get('/',(req,res)=>{
  var test = formatClaimId(31241242);
  console.log(test);
    res.send('App running');
});

app.post('/claim',(req,res)=>{
    console.log('Req:',req.body.request);
    switch (req.body.request.type) {
        
              case "LaunchRequest":
                // Launch Request
                console.log(`LAUNCH REQUEST`)
                /*context.succeed(
                  generateResponse(
                    buildSpeechletResponse("Greeting from your Insurance Manager", false),
                    {}
                  )
                )*/
                var responseText = 'Hi..welcome to claim assistant';
                var responseJson = {
                  "response": {
                      "outputSpeech": {
                        "type": "PlainText",
                        "text": responseText,
                        "ssml": "<speak>"+responseText+"</speak>"
                      }
                    }
                  };
                res.json(responseJson).end(); 
                break;
        
              case "IntentRequest":
                // Intent Request
                console.log(`NEW INTENT REQUEST`)
        
                switch(req.body.request.intent.name) {
        
                    case "claimStatusIntent":
                      console.log("claimStatusIntent  called");
                      claimStatusIntentCalled = true;
                      claimId = "";
                      resp_msg = "";
        
                      if(req.body.request.intent.slots.claimId.value){
                        ClaimNumberPresent = true;
                        console.log("Claim number in Insurance status : " + req.body.request.intent.slots.claimId.value);
                        claimId = req.body.request.intent.slots.claimId.value;
                      }
        
                      if(ClaimNumberPresent == false){
                        voice = "Please provide the claim number";
                        text = "Please provide the claim number";
                        //output(voice, text, false, context);
                        var responseJson = { 
                          "response": {
                              "outputSpeech": {
                                "type": "PlainText",
                                "text": text,
                                "ssml": "<speak>"+text+"</speak>"
                              },
                              "reprompt": {
                                "outputSpeech": {
                                  "type": 'PlainText',
                                  "text": text
                                }
                                  }
                          },                                                   
                          "shouldEndSession": false
                      }
                      res.json(responseJson);
                        break;
                      }
        
                      if(claimStatusIntentCalled && ClaimNumberPresent){
                          var responseText = "The claim status of the claim Id,,"+claimId +",, is active";
                        var responseJson = {
                            "response": {
                                "outputSpeech": {
                                  "type": "PlainText",
                                  "text": responseText,
                                  "ssml": "<speak>"+responseText+"</speak>"
                                }
                            }
                        }
                        res.json(responseJson).end();
                      }
        
                      break;
        
                    case "InsuranceDetailsIntent":
                      console.log("Insurnace Details Intent called");
                      InsuranceDetailsIntentCalled = true;
                      claimId = "";
                      resp_msg = "";
        
                      if(event.request.intent.slots.claimId.value){
                        ClaimNumberPresent = true;
                        console.log("Claim number in Insurance details : " + event.request.intent.slots.claimId.value);
                        claimId = event.request.intent.slots.claimId.value;
                      }
        
                      if(ClaimNumberPresent == false){
                        voice = "Please provide the claim number";
                        text = "Please provide the claim number";
                        //output(voice, text, false, context);
                        var responseJson = {
                          "response": {
                              "outputSpeech": {
                                "type": "PlainText",
                                "text": text,
                                "ssml": "<speak>"+text+"</speak>"
                              }
                          }
                      }
                      res.json(responseJson).end();
                        break;
                      }
        
                      if(InsuranceDetailsIntentCalled && ClaimNumberPresent){
                        /*getRequest(function(message){
                          console.log("InsuranceDetailsIntent Response : " + message);
                          output(message, message, true, context);
                        });*/

                        var responseJson = {
                          "response": {
                              "outputSpeech": {
                                "type": "PlainText",
                                "text": text,
                                "ssml": "<speak>"+text+"</speak>"
                              }
                          }
                      }
                      res.json(responseJson).end();
                      }
        
                      break;
        
                    case "claimIdIntent":
                      claimId = "";
                      resp_msg = "";
                      if(req.body.request.intent.slots.claimId.value){
                        ClaimNumberPresent = true;
                        console.log("Claim number in Insurance details : " + req.body.request.intent.slots.claimId.value);
                        claimId = req.body.request.intent.slots.claimId.value;
                      }
        
                      if(ClaimNumberPresent == false){
                        voice = "Please provide the valid claim number";
                        text = "Please provide the valid claim number";
                        //output(voice, text, false, context);
                        var responseJson = {
                          "response": {
                              "outputSpeech": {
                                "type": "PlainText",
                                "text": text,
                                "ssml": "<speak>"+text+"</speak>"
                              }
                          }
                      }
                      res.json(responseJson).end();
                        break;
                      }
        
                      if(claimStatusIntentCalled == true || InsuranceDetailsIntentCalled == true ){
                        /*getRequest(function(message){
                          console.log("Response : " + message);
                          output(message, message, true, context);
                        });*/
                        var responseText = "The claim status of the claim Id,,"+claimId +",, is active";
                        var responseJson = {
                            "response": {
                                "outputSpeech": {
                                  "type": "SSML",
                                  //"text": responseText,
                                  "ssml": "<speak>The claim status of the claim i d,<say-as interpret-as='digits'>"+claimId+"</say-as>,, is active</speak>"
                                }
                            }
                        }
                        res.json(responseJson).end();
                      }
                      else{
                        context.succeed(
                          generateResponse(
                              buildSpeechletResponse("Sorry,,, but i did not got your query...!!",true),{}
                          )
                        )
                      }
        
                      break;
        
                    case "ThanksIntent":
                      context.succeed(
                        generateResponse(
                            buildSpeechletResponse("Happy to help you",true),
                            {}
                        )
                      )
        
                      break;
        
                   default:
                    throw "Invalid intent"
                }
        
                break;
        
              case "SessionEndedRequest":
                // Session Ended Request
                console.log(`SESSION ENDED REQUEST`)
                break;
        
              default:
                context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)
        
            }
})

buildSpeechletResponse = (outputText, shouldEndSession) => {
    
      return {
        outputSpeech: {
          type: "PlainText",
          text: outputText
        },
        shouldEndSession: shouldEndSession
      }
    
    }

    function getRequest(callback){
        console.log("getRequest claim number : " + claimId);
      
        
              if(claimStatusIntentCalled == true){
                //resp_msg = "The status of the Insurance claim with the claim number,, " + gapInSpellName(parsed[0].INSURANCE_claimId) + " ,, is " + parsed[0].CLAIM_STATUS_DESC;
                //resp_msg = "According to our records, claims number,, " + gapInSpellName(parsed[0].INSURANCE_claimId) + " ,, for the policy number ,," + gapInSpellName(parsed[0].POLICY_NO) + " ,, in the name of ,, " + parsed[0].FIRST_NAME + " " + parsed[0].LAST_NAME + " ,, is with the status ,, " + parsed[0].CLAIM_STATUS_DESC;
                resp_msg = "According to our records, claims number,, " + claimId + " ,, is with the status ,,New ";
              }
              else if(InsuranceDetailsIntentCalled == true){
                // resp_msg = "The Insurance claim number,, " + gapInSpellName(parsed[0].INSURANCE_claimId) + " ,, with the policy number,, " + gapInSpellName(parsed[0].POLICY_NO) + " ,, is registered under the name of ,, " + parsed[0].FIRST_NAME + " " + parsed[0].LAST_NAME + " ,, for the incident ,, " + parsed[0].INCIDENT_DESC + " ,, of product " + parsed[0].INSURANCE_PRODUCT_NAME + " ,, with the claim status as ,, " + parsed[0].CLAIM_STATUS_DESC;
                resp_msg = "The Insurance claim number,, " + gapInSpellName(parsed[0].Claim_Reference) + " ,, with the policy number,, " + gapInSpellName(parsed[0].Policy_Number) + " ,, is registered under the name of ,, " + parsed[0].First_Name + " " + parsed[0].Last_Name + " ,, for the incident ,, " + parsed[0].Description + " ,, of product " + parsed[0].Product + " ,, with the claim status as ,, " + parsed[0].Status;
              }
              else{
                context.succeed(
                  generateResponse(
                      buildSpeechletResponse("Sorry to say,,, but i did not got your query...!!",true),{}
                  )
                )
              }
              callback(resp_msg);
    }
            
    function output( voice, text, flag) {
        
           var response = {
        
              outputSpeech: {
        
                 type: "PlainText",
        
                 text: voice
        
              },
        
              card: {
        
                 type: "Simple",
        
                 title: "System Data",
        
                 content: text
        
              },
        
           shouldEndSession: flag
        
           };        
          
        
        }
        
const server = app.listen(process.env.PORT || 443, () => {
    console.log('Express server listening on port %d', server.address().port);
});


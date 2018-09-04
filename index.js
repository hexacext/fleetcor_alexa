const express = require('express'),
Alexa = require('alexa-app'),
bodyParser = require('body-parser'),
request = require('request');
helper = require('./helper')
//config = require('./config')

const app = express();
app.use(bodyParser.json());
CA = new Alexa.app('fleetcor assistant');

var resp_msg = "";

app.get('/',(req,res)=>{
  //var test = formatClaimId(31241242);
  //console.log(test);
    res.send('App running');
});

app.post('/assistant',(req,res)=>{
    console.log('Req:',req.body.request);
    switch (req.body.request.type) {
        
              case "LaunchRequest":
                // Launch Request
                console.log(`LAUNCH REQUEST`)
                
                var responseText = "Hi welcome to fleetcor assistant"+ 
                "What can I do for you ";
                var responseJson = {
                  "response": {
                      "outputSpeech": {
                        "type": "PlainText",
                        "ssml": "<speak>"+responseText+"</speak>"
                      }
                    },
                    "reprompt": { 
                      "outputSpeech": {
                        "type": "PlainText",                        
                        "ssml": "<speak>"+responseText+"</speak>"
                      }
                    },
                    "shouldEndSession": false
                  };
                res.json(responseJson); 
                break;
        
              case "IntentRequest":
                // Intent Request
                console.log(`NEW INTENT REQUEST`)
        
                switch(req.body.request.intent.name) {
        
                    case "blockCardIntent":
                      console.log("blockCardIntent  called");
                      resp_msg = "";
                        var responseText = "<s>Sure,<break strength=\"medium\" /> Your card has been blocked successfully.<break strength=\"medium\" />Contact our help center to unblock it</s>";
                        responseText = responseText + "<s>Anything else i can do for you?</s>";
                        var responseJson = {
                            "response": {
                                "outputSpeech": {
                                  "type": "PlainText",
                                  "text": responseText,
                                  "ssml": "<speak>"+responseText+"</speak>"
                                }
                            },
                            "shouldEndSession": false
                        }
                        res.json(responseJson);
        
                      break;
        
                    case "creditLimitIntent":
                    var responseText = "<s>You have a credit limit of <break strength=\"medium\" /> $250 in your card </s>";
                    responseText = responseText + "<s>Anything else i can do for you?</s>";
                        var responseJson = {
                          "response": {
                              "outputSpeech": {
                                "type": "PlainText",
                                "text": responseText,
                                "ssml": "<speak>"+responseText+"</speak>"
                              }
                          },
                          "shouldEndSession": false
                      }
                      res.json(responseJson);
                        break;
        
                    case "accountBalanceIntent":
                    var responseText = "<s>You have <break strength=\"medium\" /> $100 balance in your account</s>";
                    responseText = responseText + "<s>Anything else i can do for you?</s>";
                        var responseJson = {
                          "response": {
                              "outputSpeech": {
                                "type": "PlainText",
                                "text": responseText,
                                "ssml": "<speak>"+responseText+"</speak>"
                              }
                          },
                          "shouldEndSession": false
                      }
                      res.json(responseJson);
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


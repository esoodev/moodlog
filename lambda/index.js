
// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const CreateMeasureIntent = require('./intents/createMeasure');
const CreateNoteIntent = require('./intents/createNote');
const GetLastRecordDateIntent = require('./intents/getLastRecordDate');

const LaunchRequestHandler = {
    // canHandle()
    // Called by the SDK to determine if the given handler is capable of processing the incoming request.
    // Accepts HandlerInput object
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    // handle()
    // Called by the SDK when invoking the request handler. 
    // This method contains the handler's request processing logic. 
    // Accepts HandlerInput and returns a Response or Promise<Response>.
    handle(handlerInput) {
        const speakOutput = 'Welcome to Mood Log. You can say Record My Mood to start recording, or say Create A Note to create a brief note about today. Say Help for more options.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Here are some things you can say. You can say Summarize to hear a brief summary of your recent logs. You can also ask me When Was My Last Log.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        // Register request handlers.
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        CreateMeasureIntent.InProgressIntentHandler,
        CreateMeasureIntent.IntentHandler,
        CreateNoteIntent.InProgressIntentHandler,
        CreateNoteIntent.IntentHandler,
        GetLastRecordDateIntent.IntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();

const dateFormat = require('dateformat');
const helper = require('./helper');
const testUserId = 'amzn1.ask.account.AHBE7GEJAVGQLWRAU3YKUEZ6EQ6YK22JDOK77YU3LTTMP7Y66VTLWGV4TLYQKI5QVBZS3DXK6UHAI5FRZ6355I7LOB635KNZGGPBGYSSVKID4J556XYZHFMTZU6N6TEPEEL2FZWN5F2PKFT67JVPE3ODPJ566QQ7EQ7YPZWWG47NJMN3X6UO7ATTIL4EIAMGZ7PJWVFB3KMGVUI';

(async () => {
    const date = await helper.getLatestLogDate(testUserId);
    const hour24 = dateFormat(date, 'H');
    const hour12 = dateFormat(date, 'h');
    const min = dateFormat(date, 'M');

    const ampm = hour24 > "12" ? "P.M." : "A.M."
    console.log(date);
    console.log(`${hour12}:${min} ${ampm}`);
})();
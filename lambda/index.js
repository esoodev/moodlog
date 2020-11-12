
// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const mysql = require('mysql2')

const username = process.env.databaseUser
const password = process.env.databasePassword
const host = process.env.databaseHost

const queryDatabase = async (query) => {
    var connection = mysql.createConnection({
        host: host,
        user: username,
        password: password,
        database: 'db'
    })
    var result;
    connection.connect();

    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log(error);
            throw error;
        }
        console.log('Ran query: ' + query);
        for (result in results)
            console.log(results[result]);
    })

    return new Promise((resolve, reject) => {
        connection.end(err => {
            if (err)
                return reject(err);
            const response = {
                statusCode: 200,
                body: JSON.stringify(result),
            };
            resolve(response);
        })
    })
}

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
        const speakOutput = 'Welcome to Mood Log. You can say Record My Mood to start recording.';
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
const InProgressCreateRecordIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'createRecordIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
};

const CreateRecordIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'createMeasureIntent';
    },
    async handle(handlerInput) {
        const userId = Alexa.getUserId(handlerInput.requestEnvelope);
        
        // Get slot values.
        const responseBuilder = handlerInput.responseBuilder;
        const getSlotValue = (slotName) => {
            return Alexa.getSlotValue(handlerInput.requestEnvelope, `measure_${slotName}`);
        };
        const stress = getSlotValue('stress');
        const nervousness = getSlotValue('nervousness');
        const impulsiveness = getSlotValue('impulsiveness');
        const optimism = getSlotValue('optimism');
        const productiveness = getSlotValue('productiveness');
        const energy = getSlotValue('energy');
        const sociability = getSlotValue('sociability');
        const clearheadedness = getSlotValue('clearheadedness');
        const regret = getSlotValue('regret');
        const happiness = getSlotValue('happiness');

        var speakOutput = 'Your response has been logged.'
        
        try {
            await queryDatabase(
                `INSERT INTO db.Measure (user_id, stress, nervousness, impulsiveness, 
                optimism, productiveness, energy, sociability, clearheadedness, 
                regret, happiness)
                VALUES ('${userId}', ${stress}, ${nervousness}, ${impulsiveness},${optimism},${productiveness},${energy},${sociability},${clearheadedness},${regret}, ${happiness});`);
        } catch (e) {
            speakOutput = `Sorry something went wrong while trying to save the log : ${e}`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

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
        InProgressCreateRecordIntentHandler,
        CreateRecordIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();

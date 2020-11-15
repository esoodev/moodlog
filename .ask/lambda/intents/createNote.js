const Alexa = require('ask-sdk-core');
const helper = require('../helper');

const intentName = 'createNoteIntent'

/**
 * Dialogue Delegation 
 */
const InProgressIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === intentName &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

/**
 * Interaction and Database Operation
 */
const IntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === intentName;
  },
  async handle(handlerInput) {
    const userId = Alexa.getUserId(handlerInput.requestEnvelope);

    // Get slot values.
    const responseBuilder = handlerInput.responseBuilder;
    const note = Alexa.getSlotValue(handlerInput.requestEnvelope, 'note');
    var speakOutput = 'Your note has been recorded. You can say Create A Note to record another note.'

    try {
      await helper.queryDatabase(
        `INSERT INTO db.Note (user_id, note)
                VALUES ('${userId}', '${note}');`);
    } catch (e) {
      speakOutput = `Sorry something went wrong while trying to save the log : ${e}`;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

module.exports = {
  InProgressIntentHandler,
  IntentHandler
}
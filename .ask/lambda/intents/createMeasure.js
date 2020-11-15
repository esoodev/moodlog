const Alexa = require('ask-sdk-core');
const helper = require('../helper');

const intentName = 'createMeasureIntent'

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
      await helper.queryDatabase(
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

module.exports = {
  InProgressIntentHandler,
  IntentHandler
}
const Alexa = require('ask-sdk-core');
const helper = require('../helper');
const dateFormat = require('dateformat');

const intentName = 'getLastRecordDateIntent'

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
    
    var speakOutput = "";

    try {
      const date = await helper.getLatestLogDate(userId);
      const hour24 = dateFormat(date, 'H');
      const hour12 = dateFormat(date, 'h');
      const min = dateFormat(date, 'M');
      const ampm = hour24 > "12" ? "P.M." : "A.M.";

      // Date format : YYYYMMDD 
      speakOutput = `Your last recorded log was on <say-as interpret-as='date'>${dateFormat(date, 'yyyymmdd')}</say-as> at ${hour12} ${min} ${ampm}`;
    } catch (e) {
      console.log(e);
      speakOutput = `I could not find any logs. Have you created any?`
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

module.exports = {
  IntentHandler
}
import * as Ask from "ask-sdk";
import { IntentRequest } from "ask-sdk-model";

interface GuessingState {
  Name: "Guessing";
  Target: number;
  Guesses: number;
}

type State = { Name: "NotStarted" } | GuessingState | { Name: "Finished" };

function startGuessing(): GuessingState {
  return {
    Name: "Guessing",
    Target: Math.round(Math.random() * 99 + 1),
    Guesses: 0
  };
}

function nextGuess(state: GuessingState): GuessingState {
  return {
    ...state,
    Guesses: state.Guesses + 1
  };
}

function getState(handlerInput: Ask.HandlerInput): State {
  const state = handlerInput.attributesManager.getSessionAttributes()["state"];
  if (state !== undefined) {
    return state as State;
  }
  return { Name: "NotStarted" };
}

function setState(handlerInput: Ask.HandlerInput, state: State) {
  handlerInput.attributesManager.setSessionAttributes({ state });
}

function exit(handlerInput: Ask.HandlerInput) {
  return handlerInput.responseBuilder.withShouldEndSession(true).getResponse();
}

function help(handlerInput: Ask.HandlerInput) {
  return handlerInput.responseBuilder
    .speak(`Guess a number between 1 and 100, or say "Stop".`)
    .reprompt(`Try saying "Is it 50"`)
    .getResponse();
}

function startNewGame(handlerInput: Ask.HandlerInput) {
  setState(handlerInput, startGuessing());
  return handlerInput.responseBuilder
    .speak("Try and guess the number I'm thinking of. It's between 1 and 100.")
    .reprompt(`Try saying "Is it 50"`)
    .getResponse();
}

function parseGuessSlot(handlerInput: Ask.HandlerInput): number | null {
  const request = handlerInput.requestEnvelope.request;
  if (request.type !== "IntentRequest") {
    return null;
  }
  const slots = request.intent.slots;
  if (slots === undefined || slots["Guess"] === undefined) {
    return null;
  }
  const guessInput = slots["Guess"];
  return parseInt(guessInput.value, 10);
}

function checkGuess(handlerInput: Ask.HandlerInput, state: GuessingState) {
  const guess = parseGuessSlot(handlerInput);
  const responseBuilder = handlerInput.responseBuilder;
  if (guess === null) {
    return responseBuilder
      .speak("Sorry, I couldn't tell what number you said.")
      .reprompt(`Try saying "Is it 50"`)
      .getResponse();
  }
  if (guess < state.Target) {
    setState(handlerInput, nextGuess(state));
    return responseBuilder
      .speak(`Is it ${guess}? Nope, too low! Guess again.`)
      .reprompt(`${guess} was too low, what's your next guess?`)
      .getResponse();
  } else if (guess > state.Target) {
    setState(handlerInput, nextGuess(state));
    return responseBuilder
      .speak(`Is it ${guess}? Nope, too high! Guess again.`)
      .reprompt(`${guess} was too high, what's your next guess?`)
      .getResponse();
  } else if (guess === state.Target) {
    setState(handlerInput, { Name: "Finished" });
    return responseBuilder
      .speak(
        `Is it ${guess}? Yes! Congratulations, you guessed it in ${state.Guesses +
          1} tries. Would you like to play again?`
      )
      .withShouldEndSession(false)
      .getResponse();
  } else {
    return responseBuilder
      .speak("Sorry, I couldn't tell what number you said.")
      .reprompt(`Try saying "Is it 50"`)
      .getResponse();
  }
}

export const handler = Ask.SkillBuilders.custom()
  .addRequestInterceptors(input => {
    console.log(JSON.stringify(input.requestEnvelope.request));
  })
  .addResponseInterceptors((input, output) => {
    if (output !== undefined) {
      console.log(JSON.stringify(output));
    }
  })
  .addRequestHandlers(
    {
      canHandle: handlerInput => {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
      },
      handle: startNewGame
    },
    {
      canHandle: handlerInput =>
        handlerInput.requestEnvelope.request.type === "IntentRequest",
      handle: handlerInput => {
        const intentRequest = handlerInput.requestEnvelope
          .request as IntentRequest;
        const state = getState(handlerInput);
        switch (intentRequest.intent.name) {
          case "GuessIntent":
            const startedState =
              state.Name === "Guessing" ? state : startGuessing();
            return checkGuess(handlerInput, startedState);
          case "AMAZON.YesIntent":
            if (state.Name === "Finished") {
              return startNewGame(handlerInput);
            } else {
              return help(handlerInput);
            }
          case "AMAZON.NoIntent":
            if (state.Name === "Finished") {
              return exit(handlerInput);
            } else {
              return help(handlerInput);
            }
          case "AMAZON.HelpIntent":
            return help(handlerInput);
          case "AMAZON.StopIntent":
            return exit(handlerInput);
          default:
            throw new Error(`Unhandled intent`);
        }
      }
    }
  )
  .addErrorHandler(
    () => true,
    (input, error) => {
      console.error(error);
      return input.responseBuilder
        .speak("Oops, something went wrong")
        .getResponse();
    }
  )
  .lambda();

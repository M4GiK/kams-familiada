/**
 * Speech recognition module using Web Speech API
 * Provides voice input for answer recognition (Polish language)
 */

/** Type definitions for Web Speech API */
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
    SpeechGrammarList?: typeof SpeechGrammarList;
    webkitSpeechGrammarList?: typeof SpeechGrammarList;
    SpeechRecognitionEvent?: typeof SpeechRecognitionEvent;
    webkitSpeechRecognitionEvent?: typeof SpeechRecognitionEvent;
  }
}

/** Browser-specific SpeechRecognition constructor */
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

/** Browser-specific SpeechGrammarList constructor */
const SpeechGrammarListClass = window.SpeechGrammarList || window.webkitSpeechGrammarList;

/** Speech recognition instance (null if not supported) */
let recognition: SpeechRecognition | null = SpeechRecognitionClass ? new SpeechRecognitionClass() : null;

/** Speech grammar list instance (null if not supported) */
let speechRecognitionList: SpeechGrammarList | null = SpeechGrammarListClass ? new SpeechGrammarListClass() : null;

/**
 * Checks if speech recognition is supported in the current browser
 * @returns True if all required APIs are available, false otherwise
 */
export function isSupported(): boolean {
  return Boolean(SpeechRecognitionClass && SpeechGrammarListClass && recognition && speechRecognitionList);
}

/**
 * Loads a grammar with expected words for better recognition accuracy
 * @param words - Array of expected answer words
 */
export function loadGrammar(words: string[]): void {
  if (!isSupported() || !recognition || !speechRecognitionList) return;
  
  const grammar = `#JSGF V1.0; grammar colors; public <color> = ${words.join(' | ')} ;`;
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'pl-PL';
  recognition.interimResults = false;
  recognition.maxAlternatives = 10;
}

/**
 * Starts speech recognition and returns results as a promise
 * @returns Promise that resolves with recognition results or rejects on error
 */
export function start(): Promise<SpeechRecognitionResultList> {
  return new Promise((resolve, reject) => {
    if (!isSupported() || !recognition) {
      reject('Speech recognition is not supported in this browser');
      return;
    }

    recognition.onspeechend = () => {
      if (recognition) recognition.stop();
    };

    recognition.onnomatch = () => {
      reject('No match');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      reject('Error occurred in recognition: ' + event.error);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resolve(event.results);
    };

    recognition.start();
  });
}

export default {
  isSupported,
  loadGrammar,
  start,
};

// Speech recognition and audio synthesis service

// Type definition for Web Speech Recognition API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private synthesisUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognition = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      } catch (err) {
        console.warn('SpeechRecognition failed to initialize:', err);
      }
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onStateChange: (listening: boolean) => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use text typing or Google Chrome.');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    this.stopPlayback();

    this.recognition.onstart = () => {
      this.isListening = true;
      onStateChange(true);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        onResult(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      if (event.error === 'not-allowed') {
        onError('Microphone access was denied. Please allow microphone permissions in your browser bar.');
      } else if (event.error === 'no-speech') {
        // Normal silence timeout, no alert needed
      } else {
        onError(`Speech recognition notice: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onStateChange(false);
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      onError('Could not start speech listening. Please try again.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      this.isListening = false;
    }
  }

  public stopPlayback(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  // Play audio from base64 WAV (returned by Gemini TTS) or fallback to browser TTS
  public async playCoachAudio(
    text: string,
    audioBase64?: string,
    playbackRate: number = 1.0,
    onEnded?: () => void
  ): Promise<void> {
    this.stopPlayback();

    // 1. If we have high-fidelity WAV base64 from Gemini TTS, play it
    if (audioBase64) {
      try {
        const audioSrc = `data:audio/wav;base64,${audioBase64}`;
        const audio = new Audio(audioSrc);
        this.currentAudio = audio;
        audio.playbackRate = playbackRate;

        audio.onended = () => {
          this.currentAudio = null;
          onEnded?.();
        };

        audio.onerror = (e) => {
          console.warn('Audio playback error, falling back to Web Speech Synthesis', e);
          this.fallbackBrowserSpeech(text, playbackRate, onEnded);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('Error playing base64 audio, using fallback:', err);
      }
    }

    // 2. Fallback to Web Speech Synthesis
    this.fallbackBrowserSpeech(text, playbackRate, onEnded);
  }

  private fallbackBrowserSpeech(
    text: string,
    playbackRate: number = 1.0,
    onEnded?: () => void
  ): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnded?.();
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.synthesisUtterance = utterance;

    utterance.rate = playbackRate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Try to find a pleasant natural English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel')) &&
        v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      this.synthesisUtterance = null;
      onEnded?.();
    };

    utterance.onerror = () => {
      this.synthesisUtterance = null;
      onEnded?.();
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechService = new SpeechService();

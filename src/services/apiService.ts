import { CoachPersona, CefrLevel, LanguageFeedback, Scenario, Message, PronunciationEvaluation, SessionDiagnostic } from '../types';

export interface CoachChatResponse {
  coachReply: string;
  feedback: LanguageFeedback;
}

export async function sendUserSpeechToCoach(
  scenario: Scenario,
  messages: Message[],
  userSpeech: string,
  coachPersona: CoachPersona,
  targetLevel: CefrLevel
): Promise<CoachChatResponse> {
  const response = await fetch('/api/coach/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
      userSpeech,
      coachPersona,
      targetLevel,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.details || `Server responded with ${response.status}`);
  }

  return response.json();
}

export async function requestCoachTts(text: string, voiceName: string = 'Kore'): Promise<string | null> {
  try {
    const response = await fetch('/api/coach/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName }),
    });

    if (!response.ok) {
      console.warn('TTS request was not ok, falling back to Web Speech Synthesis');
      return null;
    }

    const data = await response.json();
    return data.audioBase64 || null;
  } catch (err) {
    console.warn('TTS fetch failed, will use client speech synthesis fallback:', err);
    return null;
  }
}

export async function evaluatePronunciationAttempt(
  targetPhrase: string,
  userSpokenText: string,
  phonemeFocus?: string
): Promise<PronunciationEvaluation> {
  const response = await fetch('/api/drills/pronunciation-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetPhrase,
      userSpokenText,
      phonemeFocus,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Pronunciation check failed (${response.status})`);
  }

  return response.json();
}

export async function generateSessionDiagnostic(
  scenario: Scenario,
  messages: Message[]
): Promise<SessionDiagnostic> {
  const response = await fetch('/api/coach/session-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Diagnostic generation failed (${response.status})`);
  }

  return response.json();
}

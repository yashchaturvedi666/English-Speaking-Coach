import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Coach Conversation & Language Feedback Endpoint
app.post('/api/coach/chat', async (req, res) => {
  try {
    const {
      scenario,
      messages = [],
      userSpeech,
      coachPersona = 'warm_encouraging',
      targetLevel = 'B2',
    } = req.body;

    if (!userSpeech || typeof userSpeech !== 'string') {
      return res.status(400).json({ error: 'userSpeech is required' });
    }

    const personaDescriptions: Record<string, string> = {
      warm_encouraging: 'A warm, patient, and uplifting British/American language mentor who champions the learner and keeps conversations encouraging and comfortable.',
      rigorous_interviewer: 'A sharp, professional hiring manager / business executive who maintains professional decorum and demands clear, articulate, and well-structured answers.',
      native_casual: 'A friendly, colloquial native speaker peer who uses natural idioms, everyday phrasing, and light humor in a coffee-shop chat vibe.',
      ielts_examiner: 'An official IELTS / Cambridge speaking examiner who tests topical fluency, coherence, lexical resource, and grammatical accuracy.',
    };

    const personaPrompt = personaDescriptions[coachPersona] || personaDescriptions.warm_encouraging;

    const systemPrompt = `You are "Articulate Coach", an expert English language speaking coach and native conversation partner.
Current Coaching Persona: ${personaPrompt}
User Target CEFR Level: ${targetLevel}

SCENARIO CONTEXT:
- Topic: ${scenario?.title || 'Everyday English Conversation'}
- Coach Role: ${scenario?.role || 'Speaking Partner'}
- User Role: ${scenario?.userRole || 'English Learner'}
- Setting / Scenario Objective: ${scenario?.objective || 'Practice natural, spontaneous speaking and vocabulary expansion'}

TASK:
You must provide TWO essential things:
1. "coachReply": Continue the roleplay naturally in character as "${scenario?.role || 'Coach'}". Respond directly to what the user said, show realistic human reactions, and ask a follow-up or keep the conversation going smoothly. Keep the reply conversational (2 to 4 sentences). Do NOT lecture about grammar inside the coachReply; keep the roleplay realistic!
2. "feedback": Constructive, detailed language feedback specifically analyzing the user's latest utterance ("${userSpeech}").
   - "cefrRating": Estimated CEFR level of this specific utterance (e.g. "B1 - Threshold", "B2 - Vantage", "C1 - Effective Operational") with a brief 1-line reason.
   - "grammarCorrections": Array of specific grammatical, tense, preposition, or word-order errors. If the user spoke perfectly with zero errors, return an empty array or 1 minor polish.
     - "original": the exact erroneous segment
     - "corrected": the natural, correct English phrase
     - "explanation": concise explanation of the grammatical principle
     - "rule": category such as "Subject-Verb Agreement", "Preposition Choice", "Article Usage", "Tense Consistency", or "Natural Word Order"
   - "vocabularyUpgrades": Array of 1-3 opportunities to upgrade common or repetitive words into more expressive idioms, advanced adjectives, or native collocations.
     - "originalWord": word or phrase used
     - "betterAlternatives": array of 2-3 higher-level natural alternatives
     - "contextExplanation": why this alternative sounds richer or more idiomatic
   - "pronunciationTips": Array of 1-2 words from their speech that often challenge non-native speakers (e.g. irregular stress, silent letters, or tricky vowels). Provide the IPA transcription and a mouth/tongue position tip.
   - "fluencyAdvice": Insight on sentence flow, transition words, pauses, or cutting out filler words.
   - "overallEncouragement": A motivating, empathetic sentence highlighting what they did well.
   - "suggestedResponses": 3 realistic, natural responses the user could speak next if they feel stuck.`;

    // Format conversation history
    const conversationContext = messages
      .slice(-8)
      .map((m: any) => `${m.role === 'coach' ? 'Coach' : 'User'}: ${m.text}`)
      .join('\n');

    const promptText = `CONVERSATION HISTORY:\n${conversationContext}\n\nUSER'S LATEST SPOKEN SENTENCE:\n"${userSpeech}"\n\nGenerate the JSON response matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coachReply: {
              type: Type.STRING,
              description: 'The in-character dialogue response of the coach to continue the scenario',
            },
            feedback: {
              type: Type.OBJECT,
              properties: {
                cefrRating: { type: Type.STRING },
                overallEncouragement: { type: Type.STRING },
                fluencyAdvice: { type: Type.STRING },
                grammarCorrections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      original: { type: Type.STRING },
                      corrected: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      rule: { type: Type.STRING },
                    },
                    required: ['original', 'corrected', 'explanation', 'rule'],
                  },
                },
                vocabularyUpgrades: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      originalWord: { type: Type.STRING },
                      betterAlternatives: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      contextExplanation: { type: Type.STRING },
                    },
                    required: ['originalWord', 'betterAlternatives', 'contextExplanation'],
                  },
                },
                pronunciationTips: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      word: { type: Type.STRING },
                      phoneticIpa: { type: Type.STRING },
                      tip: { type: Type.STRING },
                      stressNote: { type: Type.STRING },
                    },
                    required: ['word', 'phoneticIpa', 'tip', 'stressNote'],
                  },
                },
                suggestedResponses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'cefrRating',
                'overallEncouragement',
                'fluencyAdvice',
                'grammarCorrections',
                'vocabularyUpgrades',
                'pronunciationTips',
                'suggestedResponses',
              ],
            },
          },
          required: ['coachReply', 'feedback'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/chat:', error);
    return res.status(500).json({
      error: 'Failed to process coach conversation',
      details: error?.message || String(error),
    });
  }
});

// Text-to-Speech using gemini-3.8-flash-lite-tts
app.post('/api/coach/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Clean text to avoid speech hiccups
    const cleanText = text.replace(/[*_#`]/g, '').trim().slice(0, 500);

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, articulate, natural English speech coach with engaging and friendly cadence',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio returned by TTS model' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error in /api/coach/tts:', error);
    return res.status(500).json({
      error: 'Failed to synthesize speech',
      details: error?.message || String(error),
    });
  }
});

// Pronunciation Clinic & Accent Drill Evaluation
app.post('/api/drills/pronunciation-check', async (req, res) => {
  try {
    const { targetPhrase, userSpokenText, phonemeFocus } = req.body;

    if (!targetPhrase || !userSpokenText) {
      return res.status(400).json({ error: 'targetPhrase and userSpokenText are required' });
    }

    const systemPrompt = `You are a clinical English phonetician and pronunciation coach.
The learner attempted to pronounce the target English phrase:
"${targetPhrase}"
The speech-to-text recorded what they pronounced as:
"${userSpokenText}"
Phoneme Focus Area: ${phonemeFocus || 'General Clarity and Accent Reduction'}

Evaluate the pronunciation attempt with actionable phonetic precision:
1. matchScore: 0 to 100 percentage based on accuracy.
2. phoneticBreakdown: Word by word or syllable by syllable comparison.
3. trickyPhonemes: What specific sound(s) likely caused deviation (e.g. /θ/ vs /s/, short /ɪ/ vs long /iː/, consonant reduction, aspiration).
4. mouthAndTongueTip: Concrete physical instructions (e.g. "Place the tip of your tongue gently between your teeth and exhale lightly without voicing").
5. audioDrillWords: 3 simple mini-words to practice this sound isolated (e.g. ['think', 'thought', 'therapy']).
6. encouragement: Friendly encouragement.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Evaluate the pronunciation attempt. Target: "${targetPhrase}", Recorded: "${userSpokenText}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER },
            phoneticBreakdown: { type: Type.STRING },
            trickyPhonemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mouthAndTongueTip: { type: Type.STRING },
            audioDrillWords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            encouragement: { type: Type.STRING },
          },
          required: [
            'matchScore',
            'phoneticBreakdown',
            'trickyPhonemes',
            'mouthAndTongueTip',
            'audioDrillWords',
            'encouragement',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/drills/pronunciation-check:', error);
    return res.status(500).json({
      error: 'Failed to evaluate pronunciation',
      details: error?.message || String(error),
    });
  }
});

// Comprehensive Session Diagnostic & CEFR Report
app.post('/api/coach/session-summary', async (req, res) => {
  try {
    const { scenario, messages = [] } = req.body;

    if (!messages.length) {
      return res.status(400).json({ error: 'Messages required for session summary' });
    }

    const transcript = messages
      .map((m: any) => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const systemPrompt = `You are a Senior English Language Assessor and CEFR Examiner.
Analyze this completed speaking session and prepare an inspiring, actionable Speaking Diagnostic Report:
- Scenario: ${scenario?.title || 'General Speaking'}
- Transcript:
${transcript}

Output a comprehensive JSON evaluation:
- overallCefrScore: e.g. "B2 Vantage (Upper-Intermediate)"
- fluencyScore: 0 to 100
- grammarScore: 0 to 100
- vocabularyScore: 0 to 100
- pronunciationScore: 0 to 100
- keyStrengths: Array of 3 specific positive communication behaviors observed
- growthAreas: Array of 3 prioritized patterns to refine (e.g. past tense consistency, avoiding filler words)
- recommendedVocabularyList: Array of 4-6 high-impact words or idioms related to this topic with definitions and sample sentences
- personalizedActionPlan: 3 actionable speaking exercises for their next practice session`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Generate the speaking session diagnostic report.',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallCefrScore: { type: Type.STRING },
            fluencyScore: { type: Type.NUMBER },
            grammarScore: { type: Type.NUMBER },
            vocabularyScore: { type: Type.NUMBER },
            pronunciationScore: { type: Type.NUMBER },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            growthAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedVocabularyList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['term', 'definition', 'example'],
              },
            },
            personalizedActionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'overallCefrScore',
            'fluencyScore',
            'grammarScore',
            'vocabularyScore',
            'pronunciationScore',
            'keyStrengths',
            'growthAreas',
            'recommendedVocabularyList',
            'personalizedActionPlan',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/coach/session-summary:', error);
    return res.status(500).json({
      error: 'Failed to generate session summary',
      details: error?.message || String(error),
    });
  }
});

// Vite Middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Articulate Coach server running on port ${PORT}`);
  });
}

startServer();

import type { Lang } from './ui';

type Entry = { term: string; def: string };

export const glossary: Record<string, Record<Lang, Entry>> = {
  assistant: {
    it: { term: 'Assistente AI', def: 'Un programma con cui “chatti” scrivendo o parlando: ChatGPT, Claude, Gemini, Le Chat, Copilot e simili. Risponde generando testo (e a volte immagini o codice).' },
    en: { term: 'AI assistant', def: 'A program you “chat” with by typing or speaking: ChatGPT, Claude, Gemini, Le Chat, Copilot and similar. It replies by generating text (and sometimes images or code).' },
  },
  llm: {
    it: { term: 'Modello linguistico (LLM)', def: 'Il “motore” dentro l’assistente. È un programma che ha letto enormi quantità di testo e ha imparato a prevedere quale parola viene dopo.' },
    en: { term: 'Language model (LLM)', def: 'The “engine” inside the assistant. A program that has read huge amounts of text and learned to predict which word comes next.' },
  },
  prompt: {
    it: { term: 'Prompt', def: 'Quello che scrivi all’assistente: la tua domanda o richiesta. Più è chiaro, migliore è la risposta.' },
    en: { term: 'Prompt', def: 'What you write to the assistant: your question or request. The clearer it is, the better the answer.' },
  },
  token: {
    it: { term: 'Token', def: 'Un pezzetto di testo (una parola, o parte di una parola). L’AI legge e scrive un token alla volta.' },
    en: { term: 'Token', def: 'A small piece of text (a word, or part of one). The AI reads and writes one token at a time.' },
  },
  hallucination: {
    it: { term: 'Allucinazione', def: 'Quando l’AI scrive qualcosa di falso con tono sicuro: un dato inventato, una citazione mai esistita, un link che non funziona.' },
    en: { term: 'Hallucination', def: 'When the AI writes something false in a confident tone: a made-up number, a quote that never existed, a broken link.' },
  },
  context: {
    it: { term: 'Finestra di contesto', def: 'La “memoria a breve termine” della chat: quanto testo l’AI riesce a tenere a mente in una conversazione. Se la chat è lunghissima, le parti più vecchie possono essere dimenticate.' },
    en: { term: 'Context window', def: 'The chat’s “short-term memory”: how much text the AI can keep in mind in one conversation. In a very long chat, the oldest parts may be forgotten.' },
  },
  cutoff: {
    it: { term: 'Data di aggiornamento', def: 'Il momento in cui il modello ha smesso di “studiare”. Dei fatti successivi non sa nulla, a meno che non possa cercare sul web.' },
    en: { term: 'Knowledge cutoff', def: 'The point when the model stopped “studying”. It knows nothing about later events unless it can search the web.' },
  },
  temperature: {
    it: { term: 'Temperatura', def: 'Quanto l’AI “rischia” nello scegliere le parole. Bassa: risposte prevedibili. Alta: risposte più varie e creative (ma anche più strane).' },
    en: { term: 'Temperature', def: 'How much the AI “takes risks” when choosing words. Low: predictable answers. High: more varied and creative answers (but also odder ones).' },
  },
  training: {
    it: { term: 'Addestramento', def: 'La fase in cui il modello impara leggendo testi. Non impara da te durante la chat, a meno che il servizio non usi le conversazioni per migliorare (controlla le impostazioni!).' },
    en: { term: 'Training', def: 'The phase in which the model learns by reading text. It doesn’t learn from you during the chat, unless the service uses conversations to improve (check the settings!).' },
  },
  bias: {
    it: { term: 'Bias (pregiudizio)', def: 'Una tendenza sbilanciata nelle risposte, ereditata dai testi su cui l’AI ha studiato. Per esempio dare per scontato che un medico sia uomo.' },
    en: { term: 'Bias', def: 'A skewed tendency in the answers, inherited from the texts the AI learned from. For example assuming a doctor is a man.' },
  },
  fluency: {
    it: { term: 'AI Fluency', def: 'La capacità di collaborare con l’AI in modo efficace, efficiente, etico e sicuro. Non è conoscere la tecnologia, ma saperci lavorare insieme.' },
    en: { term: 'AI Fluency', def: 'The ability to work with AI in ways that are effective, efficient, ethical and safe. It’s not about knowing the tech, but about working well with it.' },
  },
  agent: {
    it: { term: 'Agente', def: 'Un’AI che non si limita a rispondere ma compie azioni da sola per tuo conto: cerca sul web, compila moduli, usa altri programmi.' },
    en: { term: 'Agent', def: 'An AI that doesn’t just reply but takes actions on your behalf: searches the web, fills in forms, uses other programs.' },
  },
  multimodal: {
    it: { term: 'Multimodale', def: 'Un assistente che capisce non solo testo, ma anche foto, documenti, audio o voce.' },
    en: { term: 'Multimodal', def: 'An assistant that understands not just text, but also photos, documents, audio or voice.' },
  },
};

export function glossaryFor(lang: Lang) {
  return Object.entries(glossary)
    .map(([id, v]) => ({ id, ...v[lang] }))
    .sort((a, b) => a.term.localeCompare(b.term, lang));
}

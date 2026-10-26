import { API_URL, authClient, BEARER_TOKEN_KEY, tokenStorage } from '@/lib/auth';

export interface Turn {
  role: 'user' | 'assistant';
  text: string;
}

export type AskFailure = 'credits' | 'offline' | 'unavailable';

export class AskError extends Error {
  constructor(readonly kind: AskFailure) {
    super(kind);
  }
}

// An anonymous sign-in gives the app a private, nameless identity so the AI route can
// be called without the person creating an account.
export async function refreshToken(): Promise<string> {
  tokenStorage.deleteItem(BEARER_TOKEN_KEY);
  let session = await authClient.getSession();
  if (!session.data) {
    await authClient.signIn.anonymous();
    session = await authClient.getSession();
  }
  const token = tokenStorage.getItem(BEARER_TOKEN_KEY);
  if (!token) throw new AskError('unavailable');
  return token;
}

export async function askAssistant(question: string, context: string, history: Turn[]): Promise<string> {
  let token: string;
  try {
    token = await refreshToken();
  } catch (e) {
    try {
      token = await refreshToken();
    } catch {
      throw e instanceof AskError ? e : new AskError('offline');
    }
  }
  const requestId = `q${Date.now()}x${Math.random().toString(36).slice(2, 10)}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question, context, history, requestId }),
    });
  } catch {
    throw new AskError('offline');
  }
  if (res.status === 402) throw new AskError('credits');
  if (!res.ok) throw new AskError('unavailable');
  const data = (await res.json()) as { answer?: string };
  if (!data.answer) throw new AskError('unavailable');
  return data.answer;
}

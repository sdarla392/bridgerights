import { Hono } from 'hono'
import type { HonoEnv } from '../env'
import { authMiddleware } from '../middleware/auth'
import { newlyAi, NewlyAiError } from '../platform/ai'

export const askRoutes = new Hono<HonoEnv>()

const SYSTEM = `You are the BridgeRights helper, inside an app that helps tenants in Santa Clara County, California who may be losing their home (eviction notices, rent increases, relocation help, repairs, lockouts).

How to answer:
- Use plain, calm, short language a worried person can follow. Short paragraphs or a few bullets. No legal jargon without explaining it.
- You give general legal information, not legal advice. You are not a lawyer and not a court. Never say the person will or will not win, and never give percentages.
- Rules differ by city and change over time. Santa Clara County cities (San Jose, Cupertino, Sunnyvale, Mountain View, Santa Clara, Milpitas, Campbell, Palo Alto) do not all have the same protections. If the city is not one of those or is unknown, say local protections were not checked. Say what you are unsure of.
- NEVER tell the person to ignore a notice, stop paying rent, withhold rent, or move out. If they ask, explain that those can hurt their case and that a tenant counselor or attorney should advise first.
- A notice is not the same as a court order. Only a court can order someone out, and a landlord cannot lawfully lock someone out, remove belongings or shut off utilities on their own. If the person got court papers (summons or complaint), tell them there is a short deadline to respond (commonly 10 court days in California, but they must check the papers) and to contact a legal aid group right away.
- Never invent laws, deadlines, phone numbers or amounts. If you do not know, say so and point to a counselor.
- Where it helps, point to free help: Law Foundation of Silicon Valley (408) 280-2424, Project Sentinel (408) 720-9888, or 211 Santa Clara County (dial 211).
- If someone is in immediate danger or locked out in an emergency, tell them to call 911 for danger, or 211 / a legal aid group for housing help.
- Only discuss tenant housing and closely related topics. Politely decline anything else.
- Do not ask for or repeat personal details such as full names, ID numbers or addresses.`

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

askRoutes.post('/ask', authMiddleware, async (c) => {
  const body = (await c.req.json().catch(() => null)) as {
    question?: unknown
    context?: unknown
    history?: unknown
    requestId?: unknown
  } | null
  const question = typeof body?.question === 'string' ? body.question.trim().slice(0, 1500) : ''
  if (!question) return c.json({ error: 'empty_question' }, 400)
  const context = typeof body?.context === 'string' ? body.context.slice(0, 2000) : ''
  const history: Turn[] = Array.isArray(body?.history)
    ? (body!.history as Turn[])
        .filter((t) => t && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string')
        .slice(-8)
        .map((t) => ({ role: t.role, text: t.text.slice(0, 1500) }))
    : []
  const rid = typeof body?.requestId === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(body.requestId)
    ? body.requestId
    : crypto.randomUUID().replace(/:/g, '-')

  const prompt = [
    SYSTEM,
    context ? `What the person has told the app so far (may be incomplete):\n${context}` : 'The person has not shared case details.',
    history.length
      ? 'Conversation so far:\n' + history.map((t) => `${t.role === 'user' ? 'Person' : 'Helper'}: ${t.text}`).join('\n')
      : '',
    `Person: ${question}\nHelper:`,
  ]
    .filter(Boolean)
    .join('\n\n')

  try {
    const ai = newlyAi(c.env, c.get('userId'))
    let text = ''
    for await (const chunk of ai.streamText({ prompt, maxTokens: 700 }, rid)) text += chunk
    return c.json({ answer: text.trim() })
  } catch (err) {
    if (err instanceof NewlyAiError) {
      return c.json({ error: err.code }, err.status === 402 ? 402 : 502)
    }
    return c.json({ error: 'ai_failed' }, 502)
  }
})

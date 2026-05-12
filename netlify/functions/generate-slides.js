import Anthropic from '@anthropic-ai/sdk';

// Fallback used when the API key is absent (local dev) or Claude errors.
function buildStubContent(phases, vertical) {
  return phases.flatMap(phase =>
    (phase.slides ?? []).map(slideFilename => ({
      phaseId: phase.id,
      slideFilename,
      headline: phase.title,
      bullets: [
        phase.question,
        phase.job.split('.')[0].trim(),
        (phase[vertical] ?? phase.core ?? '').split('.')[0].trim(),
      ].filter(Boolean).slice(0, 3),
      speakerNote: phase.job,
    }))
  );
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const { phases, vertical, contextText, verticalLabel } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    // Return stub content so the deck still builds without an API key configured.
    return Response.json(buildStubContent(phases, vertical));
  }

  // Flatten all slides across phases into a single array for one Claude call.
  const slideSpecs = phases.flatMap(phase =>
    (phase.slides ?? []).map(slideFilename => ({
      phaseId:           phase.id,
      phaseLabel:        phase.label,
      phaseTitle:        phase.title,
      phaseQuestion:     phase.question,
      phaseJob:          phase.job,
      verticalMessaging: phase[vertical] ?? phase.core ?? '',
      slideFilename,
    }))
  );

  const prompt = `You are a B2B sales deck writer for Genea, an enterprise cloud-based access control software company.

VERTICAL: ${verticalLabel}
PROSPECT CONTEXT: "${contextText?.trim() || 'General enterprise prospect'}"

Generate tailored slide content for each of the following sales deck slides. Messaging should reflect the vertical and prospect context above.

SLIDES:
${JSON.stringify(slideSpecs, null, 2)}

Return ONLY a valid JSON array — no markdown fences, no explanation. Each element must include:
- phaseId        (copy from input)
- slideFilename  (copy from input)
- headline       One punchy sentence, max 10 words. Outcome-focused, not feature-focused.
- bullets        Array of 3–4 bullets, max 12 words each, that support the headline.
- speakerNote    2–3 sentences coaching the sales rep on delivering this slide.

Tone: confident, crisp, buyer-centric. Reference the prospect context where natural.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const start = raw.indexOf('[');
    const end   = raw.lastIndexOf(']') + 1;
    const parsed = JSON.parse(raw.slice(start, end));

    return Response.json(parsed);
  } catch (err) {
    console.error('generate-slides error:', err?.message ?? err);
    return Response.json(buildStubContent(phases, vertical));
  }
};

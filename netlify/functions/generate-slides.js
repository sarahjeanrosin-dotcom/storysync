import Anthropic from '@anthropic-ai/sdk';

function stubContent(phases, vertical) {
  return phases.flatMap(phase =>
    (phase.slides ?? []).map(slideFilename => ({
      phaseId:      phase.id,
      slideFilename,
      headline:     phase.title,
      bullets:      [
        phase.question,
        phase.job.split('.')[0].trim(),
        (phase[vertical] ?? phase.core ?? '').split('.')[0].trim(),
      ].filter(Boolean).slice(0, 3),
      speakerNote:  phase.job,
    }))
  );
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body;
  try { body = await req.json(); }
  catch { return new Response('Bad Request', { status: 400 }); }

  const { phases, vertical, contextText, verticalLabel } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(stubContent(phases, vertical));
  }

  const slideSpecs = phases.flatMap(phase =>
    (phase.slides ?? []).map(filename => ({
      phaseId:           phase.id,
      phaseLabel:        phase.label,
      phaseTitle:        phase.title,
      phaseJob:          phase.job,
      verticalMessaging: phase[vertical] ?? phase.core ?? '',
      slideFilename:     filename,
      slideType:         filename.replace('slide-', '').replace('.png', ''),
      slideTheme:        phase.theme ?? '',
      tagline:           (phase.taglines ?? {})[vertical] ?? '',
    }))
  );

  const prompt = `You are a B2B sales deck writer for Genea, an enterprise cloud-based access control software company.

VERTICAL: ${verticalLabel}
PROSPECT CONTEXT: "${contextText?.trim() || 'General enterprise prospect'}"

Generate slide content for each slide below. Use the slideType, slideTheme, and verticalMessaging to shape the content. Tailor everything to the vertical and prospect context.

SLIDES:
${JSON.stringify(slideSpecs, null, 2)}

Slide type content guide:
- title:        headline = the tagline value if provided, else a compelling vertical tagline. bullets = 2-3 value proposition statements.
- 5pillars:     headline = one-sentence intro to Genea's pillars. bullets = exactly 5 items, one per pillar in order: Cloud-Native, Open Architecture, Innovation-Forward, Mobile Credentials, Best UX & Service. Each bullet: one crisp sentence about that pillar's value.
- stats:        headline = credibility statement. bullets = exactly 3 items, each formatted as "[number or %] [what it means]" — use real-sounding Genea metrics.
- problem:      headline = names the pain. bullets = 3-4 pain points the buyer faces in this vertical today.
- stakes:       headline = names the cost of inaction. bullets = 3-4 consequences of staying on legacy/on-prem systems.
- vision:       headline = a customer outcome (write as a quote). bullets = 3-4 proof points or results a customer achieved.
- solution-1:   headline = names the first solution theme. bullets = exactly 3 feature-benefit statements.
- solution-2:   headline = names the second solution theme. bullets = exactly 3 feature-benefit statements.
- solution-3:   headline = names the third solution theme. bullets = exactly 3 feature-benefit statements.
- logos:        headline = social proof statement ("Trusted by..."). bullets = 2 statements about customer breadth or industries served.
- outcomes-1:   headline = impact statement. bullets = exactly 4 items alternating Before/After: "Before: [old way]", "After: [new way]", "Before: [old way]", "After: [new way]".
- outcomes-2:   headline = ROI statement. bullets = exactly 4 items alternating Before/After (same format as outcomes-1).
- champion:     headline = equipping statement. bullets = exactly 4 talking points an internal champion can use to sell Genea to their team.
- nextsteps:    headline = forward-looking CTA. bullets = exactly 3 concrete next steps (e.g. "Schedule a 30-min technical deep-dive").

Rules:
- Headline: max 10 words, outcome-focused, no jargon
- Bullets: max 12 words each, crisp and confident
- speakerNote: 2-3 sentences coaching the sales rep on delivering this specific slide

Return ONLY a valid JSON array — no markdown fences, no explanation text. Each element: { phaseId, slideFilename, headline, bullets, speakerNote }.`;

  try {
    const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 4096,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw   = message.content[0].text.trim();
    const start = raw.indexOf('[');
    const end   = raw.lastIndexOf(']') + 1;
    const parsed = JSON.parse(raw.slice(start, end));

    return Response.json(parsed);
  } catch (err) {
    console.error('generate-slides error:', err?.message ?? err);
    return Response.json(stubContent(phases, vertical));
  }
};

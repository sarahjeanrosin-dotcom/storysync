export async function generateAllSlideContent({ phases, vertical, contextText, verticalLabel }) {
  try {
    const res = await fetch('/.netlify/functions/generate-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phases, vertical, contextText, verticalLabel }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Content generation unavailable, using stub content:', err.message);
    return buildStubContent(phases, vertical);
  }
}

function buildStubContent(phases, vertical) {
  return phases.flatMap(phase =>
    (phase.slides ?? []).map(slideFilename => ({
      phaseId: phase.id,
      slideFilename,
      headline: phase.title,
      bullets: [
        phase.question,
        phase.job.split('.')[0].trim(),
        (phase[vertical] ?? phase.core).split('.')[0].trim(),
      ].filter(Boolean).slice(0, 3),
      speakerNote: phase.job,
    }))
  );
}

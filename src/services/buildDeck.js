import PptxGenJS from 'pptxgenjs';
import { generateAllSlideContent } from './generateContent';

// Genea brand palette (no # prefix — pptxgenjs convention)
const B = {
  bgDeep:   '080810',
  bgMid:    '0D0D1B',
  bgLight:  '12121F',
  blue:     '3B8BD4',
  white:    'FFFFFF',
  body:     'CBD5E1',
  muted:    '64748B',
  dim:      '334155',
  border:   '1E293B',
  green:    '1D9E75',
  red:      'E24B4A',
};

const PILLARS = [
  { title: 'Cloud-Native',        color: B.blue },
  { title: 'Open Architecture',   color: B.green },
  { title: 'Innovation-Forward',  color: '8BC34A' },
  { title: 'Mobile Credentials',  color: 'F9CB42' },
  { title: 'Best UX & Service',   color: 'EF9F27' },
];

function hex(nodeColor) { return nodeColor.replace('#', ''); }
function slideType(filename) { return filename.replace('slide-', '').replace('.png', ''); }

// ─── Shared helpers ───────────────────────────────────────────────────────────

function imgPlaceholder(slide, x, y, w, h, color, label) {
  slide.addShape('rect', {
    x, y, w, h,
    fill: { color: B.bgLight },
    line: { color, width: 1, dashType: 'dash' },
  });
  slide.addText(`[ ${label} ]`, {
    x, y: y + h / 2 - 0.25, w, h: 0.5,
    fontSize: 9, color: B.dim, italic: true,
    fontFace: 'Calibri', align: 'center',
  });
}

function footer(slide, color) {
  slide.addShape('rect', { x: 0.08, y: 5.32, w: 9.92, h: 0.02, fill: { color: B.border } });
  slide.addText('GENEA  ·  CONFIDENTIAL', {
    x: 0.22, y: 5.36, w: 5, h: 0.22,
    fontSize: 7, color: B.dim, fontFace: 'Calibri', charSpacing: 1,
  });
}

function accentBar(slide, color) {
  slide.addShape('rect', { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color } });
}

function phaseLabel(slide, phase, suffix, color) {
  slide.addText(`${phase.label.toUpperCase()}  ·  ${suffix}`, {
    x: 0.22, y: 0.18, w: 8, h: 0.28,
    fontSize: 7.5, bold: true, color,
    fontFace: 'Calibri', charSpacing: 2,
  });
}

function headline(slide, text, y = 0.55, w = 5.7, size = 26) {
  slide.addText(text, {
    x: 0.22, y, w, h: 1.0,
    fontSize: size, bold: true, color: B.white, fontFace: 'Calibri',
  });
}

function bulletList(slide, bullets, x = 0.22, y = 1.65, w = 5.6, h = 3.1) {
  if (!bullets?.length) return;
  slide.addText(
    bullets.slice(0, 4).map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
    { x, y, w, h, fontSize: 13, color: B.body, fontFace: 'Calibri', valign: 'top' }
  );
}

// ─── Slide templates ──────────────────────────────────────────────────────────

function addTitleSlide(pptx, { content, verticalLabel, tagline }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.bgDeep };

  // Background image placeholder (full bleed)
  imgPlaceholder(slide, 0, 0, 10, 5.625, B.border, 'background image');

  // Dark overlay panel so text reads clearly
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: B.bgDeep, transparency: 30 } });

  // Top accent bar + wordmark
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.07, fill: { color: B.blue } });
  slide.addText('GENEA', {
    x: 0.5, y: 0.2, w: 3, h: 0.45,
    fontSize: 18, bold: true, color: B.white,
    fontFace: 'Calibri', charSpacing: 4,
  });

  // Tagline (large, centered)
  slide.addText(tagline ?? content.headline ?? verticalLabel, {
    x: 0.75, y: 1.6, w: 8.5, h: 1.5,
    fontSize: 38, bold: true, color: B.white,
    fontFace: 'Calibri', align: 'center',
  });

  // Vertical label beneath tagline
  slide.addText(verticalLabel.toUpperCase(), {
    x: 0.75, y: 3.15, w: 8.5, h: 0.5,
    fontSize: 14, color: B.blue,
    fontFace: 'Calibri', align: 'center', charSpacing: 3,
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.blue } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function add5PillarsSlide(pptx, { content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.bgDeep };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.07, fill: { color: B.blue } });
  slide.addText('THE 5 PILLARS OF MODERN ACCESS CONTROL', {
    x: 0.5, y: 0.18, w: 9, h: 0.38,
    fontSize: 11, bold: true, color: B.white,
    fontFace: 'Calibri', charSpacing: 2, align: 'center',
  });
  slide.addText(content.headline ?? '', {
    x: 0.5, y: 0.65, w: 9, h: 0.4,
    fontSize: 12, color: B.body, italic: true,
    fontFace: 'Calibri', align: 'center',
  });

  // 5 pillar boxes
  const bw = 1.65, bh = 3.6, gap = 0.1875;
  const sx = (10 - (5 * bw + 4 * gap)) / 2;

  PILLARS.forEach((pillar, i) => {
    const x   = sx + i * (bw + gap);
    const desc = content.bullets?.[i] ?? '';

    slide.addShape('rect', {
      x, y: 1.2, w: bw, h: bh,
      fill: { color: B.bgLight },
      line: { color: pillar.color, width: 1.5 },
    });
    slide.addText(`${i + 1}`, {
      x, y: 1.3, w: bw, h: 0.42,
      fontSize: 14, bold: true, color: pillar.color,
      fontFace: 'Calibri', align: 'center',
    });
    slide.addShape('rect', { x, y: 1.72, w: bw, h: 0.02, fill: { color: pillar.color } });
    slide.addText(pillar.title, {
      x, y: 1.8, w: bw, h: 0.5,
      fontSize: 9.5, bold: true, color: B.white,
      fontFace: 'Calibri', align: 'center',
    });
    slide.addText(desc, {
      x: x + 0.1, y: 2.35, w: bw - 0.2, h: 2.3,
      fontSize: 9, color: B.body,
      fontFace: 'Calibri', align: 'center', valign: 'top',
    });
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.blue } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addStatsSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  slide.background = { color: B.bgDeep };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.07, fill: { color } });
  slide.addText(`${phase.label.toUpperCase()}  ·  ${phase.title.toUpperCase()}`, {
    x: 0.5, y: 0.18, w: 9, h: 0.28,
    fontSize: 8, bold: true, color,
    fontFace: 'Calibri', charSpacing: 2, align: 'center',
  });
  slide.addText(content.headline ?? phase.title, {
    x: 0.5, y: 0.55, w: 9, h: 0.65,
    fontSize: 22, bold: true, color: B.white,
    fontFace: 'Calibri', align: 'center',
  });

  // 3 stat boxes — each bullet formatted as "VALUE description"
  const stats = (content.bullets ?? []).slice(0, 3);
  const bw = 2.7, bh = 2.9, gap = 0.45;
  const sx  = (10 - (3 * bw + 2 * gap)) / 2;

  stats.forEach((stat, i) => {
    const x      = sx + i * (bw + gap);
    const parts  = stat.split(/\s+/);
    const value  = parts[0] ?? '';
    const label  = parts.slice(1).join(' ');

    slide.addShape('rect', {
      x, y: 1.45, w: bw, h: bh,
      fill: { color: B.bgMid },
      line: { color, width: 1 },
    });
    slide.addText(value, {
      x, y: 1.7, w: bw, h: 1.0,
      fontSize: 40, bold: true, color,
      fontFace: 'Calibri', align: 'center',
    });
    slide.addText(label, {
      x: x + 0.1, y: 2.8, w: bw - 0.2, h: 1.3,
      fontSize: 11, color: B.body,
      fontFace: 'Calibri', align: 'center', valign: 'top',
    });
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.blue } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addProblemSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  slide.background = { color: B.bgMid };
  accentBar(slide, color);
  phaseLabel(slide, phase, 'THE CHANGING WORLD', color);
  headline(slide, content.headline ?? phase.title);
  bulletList(slide, content.bullets);
  imgPlaceholder(slide, 6.2, 0.45, 3.55, 4.6, color, 'problem');
  footer(slide, color);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addStakesSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  slide.background = { color: B.bgMid };
  accentBar(slide, color);
  phaseLabel(slide, phase, 'THE COST OF STAYING ON-PREM', color);
  headline(slide, content.headline ?? phase.title);
  bulletList(slide, content.bullets);
  imgPlaceholder(slide, 6.2, 0.45, 3.55, 4.6, color, 'stakes');
  footer(slide, color);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addVisionSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  slide.background = { color: B.bgMid };
  accentBar(slide, color);
  phaseLabel(slide, phase, 'CASE STUDY — WHAT GOOD LOOKS LIKE', color);

  // Quote-style headline
  slide.addText(`"${content.headline ?? phase.title}"`, {
    x: 0.22, y: 0.55, w: 5.7, h: 1.2,
    fontSize: 22, bold: true, color: B.white, italic: true, fontFace: 'Calibri',
  });
  bulletList(slide, content.bullets, 0.22, 1.9, 5.6, 2.85);
  imgPlaceholder(slide, 6.2, 0.45, 3.55, 4.6, color, 'case study');
  footer(slide, color);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addSolutionSlide(pptx, { phase, content, slideFilename }) {
  const slide  = pptx.addSlide();
  const color  = hex(phase.nodeColor);
  const num    = slideFilename.match(/solution-(\d)/)?.[1] ?? '';
  slide.background = { color: B.bgMid };
  accentBar(slide, color);
  phaseLabel(slide, phase, `THE GENEA SOLUTION${num ? `  (${num} / 3)` : ''}`, color);
  headline(slide, content.headline ?? phase.title, 0.55, 9.5, 24);

  // 3 feature cards across full width
  const cw = 2.9, ch = 3.2, gap = 0.25, sx = 0.22;
  (content.bullets ?? []).slice(0, 3).forEach((feat, i) => {
    const x = sx + i * (cw + gap);
    slide.addShape('rect', {
      x, y: 1.6, w: cw, h: ch,
      fill: { color: B.bgLight },
      line: { color, width: 1 },
    });
    slide.addText(`0${i + 1}`, {
      x, y: 1.75, w: cw, h: 0.42,
      fontSize: 11, bold: true, color,
      fontFace: 'Calibri', align: 'center', charSpacing: 2,
    });
    slide.addShape('rect', { x, y: 2.17, w: cw, h: 0.02, fill: { color } });
    slide.addText(feat, {
      x: x + 0.15, y: 2.25, w: cw - 0.3, h: 2.45,
      fontSize: 11, color: B.body,
      fontFace: 'Calibri', align: 'center', valign: 'top',
    });
  });

  footer(slide, color);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addLogosSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  slide.background = { color: B.bgDeep };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.07, fill: { color } });
  slide.addText(content.headline ?? 'TRUSTED BY INDUSTRY LEADERS', {
    x: 0.5, y: 0.18, w: 9, h: 0.42,
    fontSize: 14, bold: true, color: B.white,
    fontFace: 'Calibri', align: 'center', charSpacing: 1,
  });

  // 5 × 2 logo placeholder grid
  const cols = 5, rows = 2, lw = 1.6, lh = 1.05, gx = 0.2, gy = 0.3;
  const sx   = (10 - (cols * lw + (cols - 1) * gx)) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = sx + c * (lw + gx);
      const y = 0.88 + r * (lh + gy);
      slide.addShape('rect', {
        x, y, w: lw, h: lh,
        fill: { color: B.bgLight },
        line: { color: B.border, width: 0.5 },
      });
      slide.addText('logo', {
        x, y: y + 0.33, w: lw, h: 0.38,
        fontSize: 8, color: B.dim, italic: true,
        fontFace: 'Calibri', align: 'center',
      });
    }
  }

  // Supporting copy beneath the grid
  const bullets = (content.bullets ?? []).slice(0, 2);
  if (bullets.length) {
    slide.addText(bullets.join('  ·  '), {
      x: 0.5, y: 4.9, w: 9, h: 0.3,
      fontSize: 9, color: B.muted, italic: true,
      fontFace: 'Calibri', align: 'center',
    });
  }

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.blue } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addOutcomesSlide(pptx, { phase, content, slideFilename }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  const num   = slideFilename.match(/outcomes-(\d)/)?.[1] ?? '';
  slide.background = { color: B.bgMid };
  accentBar(slide, color);
  phaseLabel(slide, phase, `THE GENEA IMPACT${num ? `  (${num} / 2)` : ''}`, color);
  headline(slide, content.headline ?? 'Here\'s What We Can Do For You', 0.55, 9.5, 22);

  // Before / After columns
  const colH = 3.5;
  slide.addShape('rect', {
    x: 0.22, y: 1.5, w: 4.3, h: colH,
    fill: { color: B.bgLight }, line: { color: B.border, width: 1 },
  });
  slide.addText('BEFORE GENEA', {
    x: 0.22, y: 1.6, w: 4.3, h: 0.32,
    fontSize: 8, bold: true, color: B.red,
    fontFace: 'Calibri', align: 'center', charSpacing: 2,
  });

  slide.addShape('rect', {
    x: 4.72, y: 1.5, w: 4.3, h: colH,
    fill: { color: B.bgLight }, line: { color: B.green, width: 1 },
  });
  slide.addText('WITH GENEA', {
    x: 4.72, y: 1.6, w: 4.3, h: 0.32,
    fontSize: 8, bold: true, color: B.green,
    fontFace: 'Calibri', align: 'center', charSpacing: 2,
  });

  const bullets = content.bullets ?? [];
  const before  = bullets.filter((_, i) => i % 2 === 0);
  const after   = bullets.filter((_, i) => i % 2 !== 0);

  if (before.length) {
    slide.addText(
      before.map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
      { x: 0.35, y: 2.05, w: 4.05, h: 2.75, fontSize: 11, color: B.body, fontFace: 'Calibri', valign: 'top' }
    );
  }
  if (after.length) {
    slide.addText(
      after.map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
      { x: 4.85, y: 2.05, w: 4.05, h: 2.75, fontSize: 11, color: B.body, fontFace: 'Calibri', valign: 'top' }
    );
  }

  footer(slide, color);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addChampionSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  slide.background = { color: B.bgMid };
  accentBar(slide, color);
  phaseLabel(slide, phase, 'ARMING YOUR CHAMPION', color);
  headline(slide, content.headline ?? 'How To Bring Genea Back To Your Team', 0.55, 9.5, 22);

  // Numbered step cards
  const cw = 2.15, ch = 3.0, gap = 0.23, sx = 0.22;
  (content.bullets ?? []).slice(0, 4).forEach((step, i) => {
    const x = sx + i * (cw + gap);
    slide.addShape('rect', {
      x, y: 1.6, w: cw, h: ch,
      fill: { color: B.bgLight }, line: { color, width: 1 },
    });
    slide.addShape('rect', { x, y: 1.6, w: cw, h: 0.42, fill: { color } });
    slide.addText(`${i + 1}`, {
      x, y: 1.66, w: cw, h: 0.3,
      fontSize: 11, bold: true, color: B.white,
      fontFace: 'Calibri', align: 'center', charSpacing: 1,
    });
    slide.addText(step, {
      x: x + 0.12, y: 2.1, w: cw - 0.24, h: 2.38,
      fontSize: 10, color: B.body,
      fontFace: 'Calibri', align: 'center', valign: 'top',
    });
  });

  footer(slide, color);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addNextStepsSlide(pptx, { content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.bgDeep };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.07, fill: { color: B.blue } });
  slide.addText('GENEA', {
    x: 0.5, y: 0.2, w: 3, h: 0.42,
    fontSize: 16, bold: true, color: B.white,
    fontFace: 'Calibri', charSpacing: 4,
  });
  slide.addText(content.headline ?? "Let's Build Something Together", {
    x: 0.5, y: 0.85, w: 9, h: 1.1,
    fontSize: 34, bold: true, color: B.white,
    fontFace: 'Calibri', align: 'center',
  });

  // Numbered step boxes
  const cw = 2.85, gap = 0.25, sx = 0.5;
  (content.bullets ?? []).slice(0, 3).forEach((step, i) => {
    const x = sx + i * (cw + gap);
    slide.addShape('rect', {
      x, y: 2.2, w: cw, h: 2.55,
      fill: { color: B.bgMid }, line: { color: B.blue, width: 1.5 },
    });
    slide.addShape('rect', { x, y: 2.2, w: cw, h: 0.42, fill: { color: B.blue } });
    slide.addText(`STEP ${i + 1}`, {
      x, y: 2.27, w: cw, h: 0.28,
      fontSize: 8, bold: true, color: B.white,
      fontFace: 'Calibri', align: 'center', charSpacing: 2,
    });
    slide.addText(step, {
      x: x + 0.15, y: 2.72, w: cw - 0.3, h: 1.9,
      fontSize: 11, color: B.body,
      fontFace: 'Calibri', align: 'center', valign: 'top',
    });
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.blue } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

// ─── Template dispatch ────────────────────────────────────────────────────────

const TEMPLATES = {
  'title':        addTitleSlide,
  '5pillars':     add5PillarsSlide,
  'stats':        addStatsSlide,
  'problem':      addProblemSlide,
  'stakes':       addStakesSlide,
  'vision':       addVisionSlide,
  'solution-1':   addSolutionSlide,
  'solution-2':   addSolutionSlide,
  'solution-3':   addSolutionSlide,
  'logos':        addLogosSlide,
  'outcomes-1':   addOutcomesSlide,
  'outcomes-2':   addOutcomesSlide,
  'champion':     addChampionSlide,
  'nextsteps':    addNextStepsSlide,
};

// ─── Main export ──────────────────────────────────────────────────────────────

export async function buildDeck({ phases, vertical, contextText, verticalLabel }) {
  const pptx = new PptxGenJS();
  pptx.layout  = 'LAYOUT_WIDE';
  pptx.author  = 'Genea';
  pptx.company = 'Genea';
  pptx.subject = `${verticalLabel} Sales Deck`;
  pptx.title   = `Genea — ${verticalLabel}`;

  const allContent = await generateAllSlideContent({ phases, vertical, contextText, verticalLabel });
  const contentMap = Object.fromEntries(
    allContent.map(item => [`${item.phaseId}::${item.slideFilename}`, item])
  );

  const prequel = phases.find(p => p.id === 'prequel');
  const tagline = prequel?.taglines?.[vertical] ?? verticalLabel;

  for (const phase of phases) {
    if (!phase.slides?.length) continue;
    for (const slideFilename of phase.slides) {
      const type    = slideType(slideFilename);
      const content = contentMap[`${phase.id}::${slideFilename}`] ?? {
        headline:    phase.title,
        bullets:     [phase.question, phase.job.split('.')[0].trim()],
        speakerNote: phase.job,
      };
      const fn = TEMPLATES[type] ?? addProblemSlide;
      fn(pptx, { phase, content, slideFilename, verticalLabel, tagline });
    }
  }

  const filename = `Genea-${verticalLabel.replace(/\s+/g, '-')}-Deck.pptx`;
  await pptx.writeFile({ fileName: filename });
  return filename;
}

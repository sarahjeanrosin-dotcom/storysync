import PptxGenJS from 'pptxgenjs';
import { generateAllSlideContent } from './generateContent';

// ─── Genea official brand palette (brand guide v3.0) ─────────────────────────
// Newport Blue  — Pantone 2955 — #003B67  — backgrounds, reversed type
// Catalina Blue — Pantone 2925 — #009CDE  — headlines, accents, security
const B = {
  navy:      '003B67',  // Newport Blue — primary dark
  navyMid:   '004F85',  // mid-navy for slide backgrounds
  navyCard:  '003057',  // card fills
  sky:       '009CDE',  // Catalina Blue — primary accent
  skyDeep:   '0078B3',  // deeper accent
  skyLight:  '33B5E6',  // lighter sky for secondary accents
  white:     'FFFFFF',
  bodyText:  'BDD8EE',  // light blue-white for body on dark
  mutedText: '5E9EC7',  // muted blue
  dimText:   '2A6899',  // dim for footers
  border:    '1A5A8A',  // subtle border
  sand:      'F5F4F0',  // brand sand (for light-bg variants)
};

// Pillar accent colors — all Catalina Blue family
const PILLARS = [
  { title: 'Cloud-Native',        color: B.sky      },
  { title: 'Open Architecture',   color: B.skyDeep  },
  { title: 'Innovation-Forward',  color: '005F8E'   },
  { title: 'Mobile Credentials',  color: B.skyLight },
  { title: 'Best UX & Service',   color: B.navyMid  },
];

const FONT = 'Gotham';  // brand print font; falls back to Calibri in PowerPoint if not installed

const VERTICAL_BACKGROUNDS = {
  highered:   '/slides/bg-highered.png',
  k12:        '/slides/bg-k12.png',
};

function slideType(filename) { return filename.replace('slide-', '').replace('.png', ''); }

// ─── Shared helpers ───────────────────────────────────────────────────────────

function imgPlaceholder(slide, x, y, w, h, label) {
  slide.addShape('rect', {
    x, y, w, h,
    fill: { color: B.navyCard },
    line: { color: B.sky, width: 1, dashType: 'dash' },
  });
  slide.addText(`[ ${label} ]`, {
    x, y: y + h / 2 - 0.25, w, h: 0.5,
    fontSize: 9, color: B.dimText, italic: true,
    fontFace: FONT, align: 'center',
  });
}

function footer(slide) {
  slide.addShape('rect', { x: 0.08, y: 5.32, w: 9.92, h: 0.02, fill: { color: B.border } });
  slide.addText('genea  ·  confidential', {
    x: 0.22, y: 5.36, w: 5, h: 0.22,
    fontSize: 7, color: B.dimText, fontFace: FONT, charSpacing: 1,
  });
}

function leftBar(slide) {
  slide.addShape('rect', { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: B.sky } });
}

function phaseLabel(slide, phase, suffix) {
  slide.addText(`${phase.label.toUpperCase()}  ·  ${suffix}`, {
    x: 0.22, y: 0.18, w: 8, h: 0.28,
    fontSize: 7.5, bold: true, color: B.sky,
    fontFace: FONT, charSpacing: 2,
  });
}

function headline(slide, text, y = 0.55, w = 5.7, size = 26) {
  slide.addText(text, {
    x: 0.22, y, w, h: 1.0,
    fontSize: size, bold: true, color: B.white, fontFace: FONT,
  });
}

function bulletList(slide, bullets, x = 0.22, y = 1.65, w = 5.6, h = 3.1) {
  if (!bullets?.length) return;
  slide.addText(
    bullets.slice(0, 4).map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
    { x, y, w, h, fontSize: 13, color: B.bodyText, fontFace: FONT, valign: 'top' }
  );
}

// ─── Slide templates ──────────────────────────────────────────────────────────

function addTitleSlide(pptx, { content, verticalLabel, tagline, bgImage }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navy };

  if (bgImage) {
    slide.addImage({ path: bgImage, x: 0, y: 0, w: 10, h: 5.625 });
  } else {
    imgPlaceholder(slide, 0, 0, 10, 5.625, 'background image');
  }

  // Newport Blue overlay so text pops over the image
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 5.625, fill: { color: B.navy, transparency: 25 } });

  // Catalina Blue top bar
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: B.sky } });

  // Wordmark
  slide.addText('genea', {
    x: 0.5, y: 0.2, w: 3, h: 0.45,
    fontSize: 20, bold: true, color: B.white,
    fontFace: FONT, charSpacing: 3,
  });

  // Tagline — Catalina Blue, large
  slide.addText(tagline ?? content.headline ?? verticalLabel, {
    x: 0.75, y: 1.55, w: 8.5, h: 1.5,
    fontSize: 38, bold: true, color: B.sky,
    fontFace: FONT, align: 'center',
  });

  // Vertical label — white beneath
  slide.addText(verticalLabel.toUpperCase(), {
    x: 0.75, y: 3.1, w: 8.5, h: 0.55,
    fontSize: 14, color: B.white,
    fontFace: FONT, align: 'center', charSpacing: 4,
  });

  // Bottom Catalina Blue bar
  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.sky } });

  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function add5PillarsSlide(pptx, { content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navy };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: B.sky } });

  slide.addText('THE 5 PILLARS OF MODERN ACCESS CONTROL', {
    x: 0.5, y: 0.18, w: 9, h: 0.38,
    fontSize: 11, bold: true, color: B.white,
    fontFace: FONT, charSpacing: 2, align: 'center',
  });

  slide.addText(content.headline ?? '', {
    x: 0.5, y: 0.65, w: 9, h: 0.38,
    fontSize: 12, color: B.bodyText, italic: true,
    fontFace: FONT, align: 'center',
  });

  // 5 pillar boxes
  const bw = 1.65, bh = 3.6, gap = 0.1875;
  const sx = (10 - (5 * bw + 4 * gap)) / 2;

  PILLARS.forEach((pillar, i) => {
    const x   = sx + i * (bw + gap);
    const desc = content.bullets?.[i] ?? '';

    slide.addShape('rect', {
      x, y: 1.2, w: bw, h: bh,
      fill: { color: B.navyCard },
      line: { color: pillar.color, width: 1.5 },
    });
    slide.addText(`${i + 1}`, {
      x, y: 1.3, w: bw, h: 0.42,
      fontSize: 14, bold: true, color: pillar.color,
      fontFace: FONT, align: 'center',
    });
    slide.addShape('rect', { x, y: 1.72, w: bw, h: 0.02, fill: { color: pillar.color } });
    slide.addText(pillar.title, {
      x, y: 1.8, w: bw, h: 0.5,
      fontSize: 9.5, bold: true, color: B.white,
      fontFace: FONT, align: 'center',
    });
    slide.addText(desc, {
      x: x + 0.1, y: 2.35, w: bw - 0.2, h: 2.3,
      fontSize: 9, color: B.bodyText,
      fontFace: FONT, align: 'center', valign: 'top',
    });
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.sky } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addStatsSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navy };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: B.sky } });
  slide.addText(`${phase.label.toUpperCase()}  ·  ${phase.title.toUpperCase()}`, {
    x: 0.5, y: 0.18, w: 9, h: 0.28,
    fontSize: 8, bold: true, color: B.sky,
    fontFace: FONT, charSpacing: 2, align: 'center',
  });
  slide.addText(content.headline ?? phase.title, {
    x: 0.5, y: 0.55, w: 9, h: 0.65,
    fontSize: 22, bold: true, color: B.white,
    fontFace: FONT, align: 'center',
  });

  const stats = (content.bullets ?? []).slice(0, 3);
  const bw = 2.7, bh = 2.9, gap = 0.45;
  const sx  = (10 - (3 * bw + 2 * gap)) / 2;

  stats.forEach((stat, i) => {
    const x     = sx + i * (bw + gap);
    const parts = stat.split(/\s+/);
    const value = parts[0] ?? '';
    const label = parts.slice(1).join(' ');

    slide.addShape('rect', {
      x, y: 1.45, w: bw, h: bh,
      fill: { color: B.navyMid },
      line: { color: B.sky, width: 1.5 },
    });
    // Top Catalina Blue accent stripe on each stat box
    slide.addShape('rect', { x, y: 1.45, w: bw, h: 0.06, fill: { color: B.sky } });

    slide.addText(value, {
      x, y: 1.7, w: bw, h: 1.0,
      fontSize: 40, bold: true, color: B.sky,
      fontFace: FONT, align: 'center',
    });
    slide.addText(label, {
      x: x + 0.1, y: 2.8, w: bw - 0.2, h: 1.3,
      fontSize: 11, color: B.bodyText,
      fontFace: FONT, align: 'center', valign: 'top',
    });
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.sky } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addProblemSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navyMid };
  leftBar(slide);
  phaseLabel(slide, phase, 'THE CHANGING WORLD');
  headline(slide, content.headline ?? phase.title);
  bulletList(slide, content.bullets);
  imgPlaceholder(slide, 6.2, 0.45, 3.55, 4.6, 'problem');
  footer(slide);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addStakesSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navyMid };
  leftBar(slide);
  phaseLabel(slide, phase, 'THE COST OF STAYING ON-PREM');
  headline(slide, content.headline ?? phase.title);
  bulletList(slide, content.bullets);
  imgPlaceholder(slide, 6.2, 0.45, 3.55, 4.6, 'stakes');
  footer(slide);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addVisionSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navyMid };
  leftBar(slide);
  phaseLabel(slide, phase, 'CASE STUDY — WHAT GOOD LOOKS LIKE');

  slide.addText(`"${content.headline ?? phase.title}"`, {
    x: 0.22, y: 0.55, w: 5.7, h: 1.2,
    fontSize: 22, bold: true, color: B.white, italic: true, fontFace: FONT,
  });
  bulletList(slide, content.bullets, 0.22, 1.9, 5.6, 2.85);
  imgPlaceholder(slide, 6.2, 0.45, 3.55, 4.6, 'case study');
  footer(slide);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addSolutionSlide(pptx, { phase, content, slideFilename }) {
  const slide = pptx.addSlide();
  const num   = slideFilename.match(/solution-(\d)/)?.[1] ?? '';
  slide.background = { color: B.navyMid };
  leftBar(slide);
  phaseLabel(slide, phase, `THE GENEA SOLUTION${num ? `  (${num} / 3)` : ''}`);

  slide.addText(content.headline ?? phase.title, {
    x: 0.22, y: 0.55, w: 9.5, h: 0.9,
    fontSize: 24, bold: true, color: B.white, fontFace: FONT,
  });

  const cw = 2.9, ch = 3.2, gap = 0.25, sx = 0.22;
  (content.bullets ?? []).slice(0, 3).forEach((feat, i) => {
    const x = sx + i * (cw + gap);
    slide.addShape('rect', {
      x, y: 1.6, w: cw, h: ch,
      fill: { color: B.navyCard },
      line: { color: B.sky, width: 1 },
    });
    // Catalina Blue top stripe
    slide.addShape('rect', { x, y: 1.6, w: cw, h: 0.04, fill: { color: B.sky } });
    slide.addText(`0${i + 1}`, {
      x, y: 1.72, w: cw, h: 0.42,
      fontSize: 11, bold: true, color: B.sky,
      fontFace: FONT, align: 'center', charSpacing: 2,
    });
    slide.addShape('rect', { x, y: 2.17, w: cw, h: 0.02, fill: { color: B.border } });
    slide.addText(feat, {
      x: x + 0.15, y: 2.25, w: cw - 0.3, h: 2.45,
      fontSize: 11, color: B.bodyText,
      fontFace: FONT, align: 'center', valign: 'top',
    });
  });

  footer(slide);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addLogosSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navy };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: B.sky } });
  slide.addText(content.headline ?? 'TRUSTED BY INDUSTRY LEADERS', {
    x: 0.5, y: 0.18, w: 9, h: 0.42,
    fontSize: 14, bold: true, color: B.white,
    fontFace: FONT, align: 'center', charSpacing: 1,
  });

  const cols = 5, rows = 2, lw = 1.6, lh = 1.05, gx = 0.2, gy = 0.3;
  const sx   = (10 - (cols * lw + (cols - 1) * gx)) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = sx + c * (lw + gx);
      const y = 0.88 + r * (lh + gy);
      slide.addShape('rect', {
        x, y, w: lw, h: lh,
        fill: { color: B.navyMid },
        line: { color: B.border, width: 0.5 },
      });
      slide.addText('logo', {
        x, y: y + 0.33, w: lw, h: 0.38,
        fontSize: 8, color: B.dimText, italic: true,
        fontFace: FONT, align: 'center',
      });
    }
  }

  const bullets = (content.bullets ?? []).slice(0, 2);
  if (bullets.length) {
    slide.addText(bullets.join('  ·  '), {
      x: 0.5, y: 4.9, w: 9, h: 0.3,
      fontSize: 9, color: B.mutedText, italic: true,
      fontFace: FONT, align: 'center',
    });
  }

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.sky } });
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addOutcomesSlide(pptx, { phase, content, slideFilename }) {
  const slide = pptx.addSlide();
  const num   = slideFilename.match(/outcomes-(\d)/)?.[1] ?? '';
  slide.background = { color: B.navyMid };
  leftBar(slide);
  phaseLabel(slide, phase, `THE GENEA IMPACT${num ? `  (${num} / 2)` : ''}`);

  slide.addText(content.headline ?? "Here's What We Can Do For You", {
    x: 0.22, y: 0.55, w: 9.5, h: 0.8,
    fontSize: 22, bold: true, color: B.white, fontFace: FONT,
  });

  // Before column — deep navy fill, sky border
  slide.addShape('rect', {
    x: 0.22, y: 1.5, w: 4.3, h: 3.5,
    fill: { color: B.navyCard }, line: { color: B.border, width: 1 },
  });
  slide.addShape('rect', { x: 0.22, y: 1.5, w: 4.3, h: 0.38, fill: { color: B.border } });
  slide.addText('BEFORE GENEA', {
    x: 0.22, y: 1.56, w: 4.3, h: 0.26,
    fontSize: 8, bold: true, color: B.bodyText,
    fontFace: FONT, align: 'center', charSpacing: 2,
  });

  // After column — Catalina Blue accent top
  slide.addShape('rect', {
    x: 4.72, y: 1.5, w: 4.3, h: 3.5,
    fill: { color: B.navyCard }, line: { color: B.sky, width: 1 },
  });
  slide.addShape('rect', { x: 4.72, y: 1.5, w: 4.3, h: 0.38, fill: { color: B.sky } });
  slide.addText('WITH GENEA', {
    x: 4.72, y: 1.56, w: 4.3, h: 0.26,
    fontSize: 8, bold: true, color: B.white,
    fontFace: FONT, align: 'center', charSpacing: 2,
  });

  const bullets = content.bullets ?? [];
  const before  = bullets.filter((_, i) => i % 2 === 0);
  const after   = bullets.filter((_, i) => i % 2 !== 0);

  if (before.length) {
    slide.addText(
      before.map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
      { x: 0.35, y: 2.02, w: 4.05, h: 2.78, fontSize: 11, color: B.bodyText, fontFace: FONT, valign: 'top' }
    );
  }
  if (after.length) {
    slide.addText(
      after.map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
      { x: 4.85, y: 2.02, w: 4.05, h: 2.78, fontSize: 11, color: B.bodyText, fontFace: FONT, valign: 'top' }
    );
  }

  footer(slide);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addChampionSlide(pptx, { phase, content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navyMid };
  leftBar(slide);
  phaseLabel(slide, phase, 'ARMING YOUR CHAMPION');

  slide.addText(content.headline ?? 'How To Bring Genea Back To Your Team', {
    x: 0.22, y: 0.55, w: 9.5, h: 0.9,
    fontSize: 22, bold: true, color: B.white, fontFace: FONT,
  });

  const cw = 2.15, ch = 3.0, gap = 0.23, sx = 0.22;
  (content.bullets ?? []).slice(0, 4).forEach((step, i) => {
    const x = sx + i * (cw + gap);
    slide.addShape('rect', {
      x, y: 1.6, w: cw, h: ch,
      fill: { color: B.navyCard }, line: { color: B.sky, width: 1 },
    });
    slide.addShape('rect', { x, y: 1.6, w: cw, h: 0.42, fill: { color: B.sky } });
    slide.addText(`${i + 1}`, {
      x, y: 1.66, w: cw, h: 0.3,
      fontSize: 11, bold: true, color: B.white,
      fontFace: FONT, align: 'center', charSpacing: 1,
    });
    slide.addText(step, {
      x: x + 0.12, y: 2.1, w: cw - 0.24, h: 2.38,
      fontSize: 10, color: B.bodyText,
      fontFace: FONT, align: 'center', valign: 'top',
    });
  });

  footer(slide);
  if (content.speakerNote) slide.addNotes(content.speakerNote);
}

function addNextStepsSlide(pptx, { content }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.navy };

  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.08, fill: { color: B.sky } });

  slide.addText('genea', {
    x: 0.5, y: 0.2, w: 3, h: 0.42,
    fontSize: 16, bold: true, color: B.white,
    fontFace: FONT, charSpacing: 3,
  });

  slide.addText(content.headline ?? "Let's Build Something Together", {
    x: 0.5, y: 0.85, w: 9, h: 1.1,
    fontSize: 32, bold: true, color: B.sky,
    fontFace: FONT, align: 'center',
  });

  const cw = 2.85, gap = 0.25, sx = 0.5;
  (content.bullets ?? []).slice(0, 3).forEach((step, i) => {
    const x = sx + i * (cw + gap);
    slide.addShape('rect', {
      x, y: 2.2, w: cw, h: 2.55,
      fill: { color: B.navyMid }, line: { color: B.sky, width: 1.5 },
    });
    slide.addShape('rect', { x, y: 2.2, w: cw, h: 0.42, fill: { color: B.sky } });
    slide.addText(`STEP ${i + 1}`, {
      x, y: 2.27, w: cw, h: 0.28,
      fontSize: 8, bold: true, color: B.white,
      fontFace: FONT, align: 'center', charSpacing: 2,
    });
    slide.addText(step, {
      x: x + 0.15, y: 2.72, w: cw - 0.3, h: 1.9,
      fontSize: 11, color: B.bodyText,
      fontFace: FONT, align: 'center', valign: 'top',
    });
  });

  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.sky } });
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
  const bgImage = VERTICAL_BACKGROUNDS[vertical] ?? null;

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
      fn(pptx, { phase, content, slideFilename, verticalLabel, tagline, bgImage });
    }
  }

  const filename = `Genea-${verticalLabel.replace(/\s+/g, '-')}-Deck.pptx`;
  await pptx.writeFile({ fileName: filename });
  return filename;
}

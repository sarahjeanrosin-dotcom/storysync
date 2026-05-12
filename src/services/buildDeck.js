import PptxGenJS from 'pptxgenjs';
import { generateAllSlideContent } from './generateContent';

// Genea brand palette — no # prefix (pptxgenjs convention)
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
};

function hex(nodeColor) {
  return nodeColor.replace('#', '');
}

function addCoverSlide(pptx, { verticalLabel, contextText }) {
  const slide = pptx.addSlide();
  slide.background = { color: B.bgDeep };

  // Top accent bar
  slide.addShape('rect', { x: 0, y: 0, w: 10, h: 0.07, fill: { color: B.blue } });

  // Wordmark
  slide.addText('GENEA', {
    x: 0.5, y: 0.22, w: 3, h: 0.5,
    fontSize: 20, bold: true, color: B.white,
    fontFace: 'Calibri', charSpacing: 4,
  });

  // Vertical / deck title
  slide.addText(verticalLabel, {
    x: 0.5, y: 1.5, w: 9, h: 1.4,
    fontSize: 44, bold: true, color: B.blue,
    fontFace: 'Calibri', align: 'center',
  });

  slide.addText('Sales Presentation', {
    x: 0.5, y: 2.95, w: 9, h: 0.6,
    fontSize: 18, color: B.body,
    fontFace: 'Calibri', align: 'center',
  });

  if (contextText?.trim()) {
    slide.addText(contextText.trim(), {
      x: 1.5, y: 3.7, w: 7, h: 0.9,
      fontSize: 11, color: B.muted, italic: true,
      fontFace: 'Calibri', align: 'center',
    });
  }

  // Bottom bar
  slide.addShape('rect', { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: B.blue } });
}

function addContentSlide(pptx, { phase, content, slideFilename }) {
  const slide = pptx.addSlide();
  const color = hex(phase.nodeColor);
  const slideName = slideFilename.replace('slide-', '').replace('.png', '');

  slide.background = { color: B.bgMid };

  // Left phase-color accent bar
  slide.addShape('rect', { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color } });

  // Phase + title label
  slide.addText(`${phase.label.toUpperCase()}  ·  ${phase.title.toUpperCase()}`, {
    x: 0.22, y: 0.18, w: 5.8, h: 0.28,
    fontSize: 7.5, bold: true, color,
    fontFace: 'Calibri', charSpacing: 2,
  });

  // Headline
  slide.addText(content.headline ?? phase.title, {
    x: 0.22, y: 0.55, w: 5.7, h: 1.0,
    fontSize: 26, bold: true, color: B.white,
    fontFace: 'Calibri',
  });

  // Bullets
  const bullets = (content.bullets ?? []).slice(0, 4);
  if (bullets.length) {
    slide.addText(
      bullets.map(b => ({ text: b, options: { bullet: true, paraSpaceAfter: 8 } })),
      {
        x: 0.22, y: 1.65, w: 5.6, h: 3.1,
        fontSize: 13, color: B.body,
        fontFace: 'Calibri', valign: 'top',
      }
    );
  }

  // Image placeholder (right column)
  slide.addShape('rect', {
    x: 6.2, y: 0.45, w: 3.55, h: 4.6,
    fill: { color: B.bgLight },
    line: { color, width: 1, dashType: 'dash' },
  });

  slide.addText(`[ ${slideName} ]`, {
    x: 6.2, y: 2.4, w: 3.55, h: 0.5,
    fontSize: 9, color: B.dim, italic: true,
    fontFace: 'Calibri', align: 'center',
  });

  slide.addText('image placeholder', {
    x: 6.2, y: 2.9, w: 3.55, h: 0.35,
    fontSize: 8, color: B.dim,
    fontFace: 'Calibri', align: 'center',
  });

  // Footer rule
  slide.addShape('rect', {
    x: 0.08, y: 5.32, w: 9.92, h: 0.001,
    line: { color: B.border, width: 0.5 },
  });

  slide.addText('GENEA  ·  CONFIDENTIAL', {
    x: 0.22, y: 5.36, w: 5, h: 0.22,
    fontSize: 7, color: B.dim,
    fontFace: 'Calibri', charSpacing: 1,
  });

  if (content.speakerNote) {
    slide.addNotes(content.speakerNote);
  }
}

export async function buildDeck({ phases, vertical, contextText, verticalLabel }) {
  const pptx = new PptxGenJS();
  pptx.layout  = 'LAYOUT_WIDE';
  pptx.author  = 'Genea';
  pptx.company = 'Genea';
  pptx.subject = `${verticalLabel} Sales Deck`;
  pptx.title   = `Genea — ${verticalLabel}`;

  const allContent = await generateAllSlideContent({ phases, vertical, contextText, verticalLabel });

  // Index generated content by "phaseId::slideFilename"
  const contentMap = Object.fromEntries(
    allContent.map(item => [`${item.phaseId}::${item.slideFilename}`, item])
  );

  addCoverSlide(pptx, { verticalLabel, contextText });

  for (const phase of phases) {
    if (!phase.slides?.length) continue;
    for (const slideFilename of phase.slides) {
      const content = contentMap[`${phase.id}::${slideFilename}`] ?? {
        headline: phase.title,
        bullets: [phase.question, phase.job.split('.')[0].trim()],
        speakerNote: phase.job,
      };
      addContentSlide(pptx, { phase, content, slideFilename });
    }
  }

  const filename = `Genea-${verticalLabel.replace(/\s+/g, '-')}-Deck.pptx`;
  await pptx.writeFile({ fileName: filename });
  return filename;
}

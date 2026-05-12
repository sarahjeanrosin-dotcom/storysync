import { useState } from 'react';
import Lightbox from './Lightbox';

const DownloadIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

async function downloadSingle(filename) {
  try {
    const res  = await fetch(`/slides/${filename}`);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click();
    URL.revokeObjectURL(url);
  } catch { /* skip if file not yet uploaded */ }
}

async function downloadAllAsZip(phase) {
  if (!phase.slides?.length) return;
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  await Promise.all(
    phase.slides.map(async (filename) => {
      try {
        const res = await fetch(`/slides/${filename}`);
        if (!res.ok) return;
        zip.file(filename, await res.blob());
      } catch { /* skip missing */ }
    })
  );

  const blob = await zip.generateAsync({ type: 'blob' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `${phase.label.replace(/\s+/g, '-')}-slides.zip`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

function SlideThumbnail({ slide, onView, onDownload }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-[200px] shrink-0 group">
      <div
        className="relative w-full rounded-lg overflow-hidden border border-white/8"
        style={{ aspectRatio: '16/9' }}
      >
        {hasError ? (
          <div className="absolute inset-0 bg-[#1a1a2e] flex flex-col items-center justify-center gap-1 p-2">
            <span className="text-[9px] text-slate-700 text-center break-all leading-tight">
              {slide}
            </span>
            <span className="text-[8px] text-slate-800">not yet uploaded</span>
          </div>
        ) : (
          <img
            src={`/slides/${slide}`}
            alt={slide.replace('.png', '')}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={onView}
            onError={() => setHasError(true)}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={onView}
            className="bg-white/12 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-md transition-colors"
          >
            View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            title="Download"
            className="bg-white/12 hover:bg-white/20 text-white p-1.5 rounded-md transition-colors"
          >
            <DownloadIcon size={14} />
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-[9px] text-slate-700 truncate text-center px-1">
        {slide.replace('slide-', '').replace('.png', '')}
      </p>
    </div>
  );
}

export default function DetailPanel({ phase, vertical, onClose }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZipping, setIsZipping]         = useState(false);

  const verticalContent = phase[vertical] ?? phase.core;
  const { nodeColor }   = phase;
  const slides          = phase.slides ?? [];

  const handleDownloadAll = async () => {
    setIsZipping(true);
    await downloadAllAsZip(phase);
    setIsZipping(false);
  };

  return (
    <>
      <div className="mt-8 bg-[#0d0d1b] border border-white/5 rounded-2xl p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: nodeColor }}
            >
              {phase.label}
            </span>
            <h2 className="text-3xl font-bold text-white mt-1 leading-tight">
              {phase.title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 mt-1 ml-4 shrink-0">
            {slides.length > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-[#1a1a2e] hover:bg-[#1e1e35] border border-white/8 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                <DownloadIcon size={12} />
                {isZipping ? 'Zipping…' : `Download ${slides.length} slide${slides.length !== 1 ? 's' : ''}`}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-slate-600 hover:text-slate-300 transition-colors text-2xl leading-none p-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: mindset + job + energy */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Customer Mindset */}
            <div
              className="bg-[#12121f] rounded-xl px-5 py-4"
              style={{ borderLeft: `4px solid ${nodeColor}` }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: nodeColor }}
              >
                Customer Mindset
              </p>
              <p className="text-slate-200 italic text-base leading-snug">
                "{phase.question}"
              </p>
            </div>

            {/* Rep job */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Your Job in This Phase
              </p>
              <p className="text-slate-300 leading-relaxed text-sm">{phase.job}</p>
            </div>

            {/* Energy bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Energy Level
                </p>
                <span className="text-xs font-medium capitalize" style={{ color: nodeColor }}>
                  {phase.energy}
                </span>
              </div>
              <div className="h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${phase.energyPct}%`,
                    background: `linear-gradient(to right, ${nodeColor}77, ${nodeColor})`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-700 tracking-wide">CALM</span>
                <span className="text-[9px] text-slate-700 tracking-wide">PEAK</span>
              </div>
            </div>
          </div>

          {/* Right: vertical messaging */}
          <div
            className="rounded-xl p-5 flex flex-col border"
            style={{
              backgroundColor: `${nodeColor}10`,
              borderColor: `${nodeColor}30`,
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: nodeColor }}
            >
              Vertical Messaging
            </p>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">
              {verticalContent}
            </p>
          </div>
        </div>

        {/* Slides section */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Slides
            <span className="ml-2 text-slate-700 font-normal normal-case tracking-normal">
              {slides.length > 0 ? `${slides.length} assigned` : '· none'}
            </span>
          </p>

          {slides.length > 0 ? (
            <div
              className="flex gap-4 overflow-x-auto pb-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e1e35 transparent' }}
            >
              {slides.map((slide, i) => (
                <SlideThumbnail
                  key={slide}
                  slide={slide}
                  onView={() => setLightboxIndex(i)}
                  onDownload={() => downloadSingle(slide)}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-700 italic">No slides assigned yet</p>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          slides={slides}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(p => Math.max(0, p - 1))}
          onNext={() => setLightboxIndex(p => Math.min(slides.length - 1, p + 1))}
        />
      )}
    </>
  );
}

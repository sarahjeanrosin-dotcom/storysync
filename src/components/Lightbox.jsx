import { useEffect, useCallback } from 'react';

export default function Lightbox({ slides, currentIndex, onClose, onPrev, onNext }) {
  const hasMultiple = slides.length > 1;

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft')  onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 flex items-center"
      onClick={onClose}
    >
      {/* Prev */}
      <div className="w-16 shrink-0 flex justify-center">
        {hasMultiple && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={currentIndex === 0}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/12 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-lg"
          >
            ←
          </button>
        )}
      </div>

      {/* Image */}
      <div
        className="flex-1 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`/slides/${slides[currentIndex]}`}
          alt={slides[currentIndex].replace('.png', '')}
          className="max-h-[82vh] max-w-full rounded-xl shadow-2xl block"
        />
        {hasMultiple && (
          <p className="text-xs text-slate-600">
            {currentIndex + 1} / {slides.length}
          </p>
        )}
      </div>

      {/* Next */}
      <div className="w-16 shrink-0 flex justify-center">
        {hasMultiple && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={currentIndex === slides.length - 1}
            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/12 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-lg"
          >
            →
          </button>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-5 text-slate-500 hover:text-white text-3xl leading-none transition-colors"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

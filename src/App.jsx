import { useState } from 'react';
import StoryArc from './components/StoryArc';
import DetailPanel from './components/DetailPanel';
import PasswordGate from './components/PasswordGate';
import { verticals, phases } from './data/phases';
import { SESSION_KEY } from './config';
import { buildDeck } from './services/buildDeck';

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [selectedPhase,    setSelectedPhase]    = useState(null);
  const [selectedVertical, setSelectedVertical] = useState('core');
  const [contextText,      setContextText]      = useState('');
  const [isBuilding,       setIsBuilding]       = useState(false);
  const [buildError,       setBuildError]       = useState('');

  if (!authed) {
    return <PasswordGate onAuthenticated={() => setAuthed(true)} />;
  }

  const handleSelectPhase = (phase) => {
    setSelectedPhase(prev => prev?.id === phase.id ? null : phase);
  };

  const handleBuild = async () => {
    setIsBuilding(true);
    setBuildError('');
    try {
      const verticalLabel = verticals.find(v => v.id === selectedVertical)?.label ?? 'Core';
      await buildDeck({ phases, vertical: selectedVertical, contextText, verticalLabel });
    } catch (err) {
      console.error('Deck build failed:', err);
      setBuildError('Something went wrong building the deck. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#080810] text-slate-100"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <header className="px-6 py-5 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-white">Genea</span>
              <span style={{ color: '#3B8BD4' }}> · </span>
              <span style={{ color: '#7ab8e8' }}>Demo Arc</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 tracking-widest uppercase">
              Sales Story Arc — Interactive Guide
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-500 font-medium uppercase tracking-widest">
              Vertical
            </label>
            <select
              value={selectedVertical}
              onChange={(e) => setSelectedVertical(e.target.value)}
              className="bg-[#12121f] border border-white/8 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600/40 cursor-pointer"
            >
              {verticals.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 pt-6 pb-16">

        {/* Build Deck */}
        <div className="mb-8 bg-[#0d0d1b] border border-white/5 rounded-2xl p-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Build Deck
          </p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1.5 block">
                Prospect context
              </label>
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="e.g. Healthcare system, 3 hospitals, worried about HIPAA compliance and terminated employee access…"
                className="w-full bg-[#12121f] border border-white/8 text-slate-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/40 resize-none placeholder:text-slate-700"
                rows={2}
              />
            </div>
            <button
              onClick={handleBuild}
              disabled={isBuilding}
              className="shrink-0 bg-[#3B8BD4] hover:bg-[#2d7bc0] active:bg-[#2472b3] disabled:opacity-50 disabled:cursor-wait text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
            >
              {isBuilding ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Building…
                </span>
              ) : 'Build Deck'}
            </button>
          </div>
          {buildError && (
            <p className="mt-3 text-xs text-red-400">{buildError}</p>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 tracking-widest uppercase mb-1">
          Click any node to explore the phase
        </p>

        <StoryArc selectedPhase={selectedPhase} onSelectPhase={handleSelectPhase} />

        {selectedPhase && (
          <div key={selectedPhase.id} className="animate-fade-up">
            <DetailPanel
              phase={selectedPhase}
              vertical={selectedVertical}
              onClose={() => setSelectedPhase(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

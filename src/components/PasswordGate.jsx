import { useState } from 'react';
import { APP_PASSWORD, SESSION_KEY } from '../config';

export default function PasswordGate({ onAuthenticated }) {
  const [value, setValue]     = useState('');
  const [error, setError]     = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === APP_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      onAuthenticated();
    } else {
      setError(true);
      setShaking(true);
      setValue('');
      setTimeout(() => setShaking(false), 450);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center px-4">
      <div className="bg-[#0d0d1b] border border-[#3B8BD4]/20 rounded-2xl p-10 w-full max-w-sm shadow-2xl shadow-black/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Genea <span style={{ color: '#3B8BD4' }}>Demo Arc</span>
          </h1>
          <p className="text-xs text-slate-600 uppercase tracking-widest mt-1">
            Sales Interactive Guide
          </p>
        </div>

        <form onSubmit={handleSubmit} className={shaking ? 'animate-shake' : ''}>
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2">
            Password
          </label>
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Enter password"
            autoFocus
            className={`w-full bg-[#12121f] border rounded-xl px-4 py-3 text-slate-200 text-sm placeholder-slate-700 focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-600/50 focus:ring-red-600/20'
                : 'border-[#3B8BD4]/25 focus:ring-[#3B8BD4]/30 focus:border-[#3B8BD4]/60'
            }`}
          />
          {error && (
            <p className="text-xs text-red-400 mt-2 ml-1">Incorrect password — try again.</p>
          )}
          <button
            type="submit"
            className="w-full mt-5 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#3B8BD4' }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

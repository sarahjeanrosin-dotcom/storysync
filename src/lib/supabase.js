import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = SUPABASE_URL && SUPABASE_ANON
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;

// Fetch vertical messaging for all phases.
// Returns null if Supabase is not yet configured — callers fall back to phases.js data.
export async function fetchVerticalMessaging(vertical) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('vertical_messaging')
    .select('phase_id, content')
    .eq('vertical_id', vertical);

  if (error) {
    console.warn('Supabase: fetchVerticalMessaging failed —', error.message);
    return null;
  }

  // Returns { [phaseId]: content } lookup
  return Object.fromEntries(data.map(row => [row.phase_id, row.content]));
}

// Fetch positioning statements for a vertical (will be populated from CSV).
export async function fetchPositioningStatements(vertical) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('positioning_statements')
    .select('slide_type, content, theme')
    .eq('vertical_id', vertical);

  if (error) {
    console.warn('Supabase: fetchPositioningStatements failed —', error.message);
    return null;
  }

  return data;
}

// Resolve a slide image URL from Supabase Storage.
// Returns null until images are uploaded.
export function getSlideImageUrl(filename) {
  if (!supabase) return null;
  const { data } = supabase.storage.from('slide-images').getPublicUrl(filename);
  return data?.publicUrl ?? null;
}

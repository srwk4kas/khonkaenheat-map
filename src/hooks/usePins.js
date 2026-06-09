import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const LS_KEY = 'kkmap-pins';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'); } catch { return []; }
}
function saveLocal(pins) {
  localStorage.setItem(LS_KEY, JSON.stringify(pins));
}

export function usePins() {
  const [pins,    setPins]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  /* ── Load ── */
  useEffect(() => {
    if (supabase) {
      setLoading(true);
      supabase
        .from('pins')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error: e }) => {
          if (e) setError(e.message);
          else setPins(data ?? []);
          setLoading(false);
        });
    } else {
      setPins(loadLocal());
    }
  }, []);

  /* ── Add pin ── */
  const addPin = useCallback(async (lat, lng) => {
    const optimistic = {
      id:         crypto.randomUUID(),
      lat:        +lat.toFixed(6),
      lng:        +lng.toFixed(6),
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setPins(prev => {
      const next = [optimistic, ...prev];
      if (!supabase) saveLocal(next);
      return next;
    });

    if (supabase) {
      const { data, error: e } = await supabase
        .from('pins')
        .insert({ lat: optimistic.lat, lng: optimistic.lng })
        .select()
        .single();

      if (e) {
        // Rollback
        setPins(prev => prev.filter(p => p.id !== optimistic.id));
        setError(e.message);
      } else {
        // Replace optimistic with real record
        setPins(prev => prev.map(p => p.id === optimistic.id ? data : p));
      }
    }
  }, []);

  /* ── Delete last pin ── */
  const deleteLastPin = useCallback(async () => {
    setPins(prev => {
      if (!prev.length) return prev;
      const [last, ...rest] = prev; // sorted newest-first

      if (supabase) {
        supabase.from('pins').delete().eq('id', last.id).then(({ error: e }) => {
          if (e) { setError(e.message); setPins(p => [last, ...p]); } // rollback
        });
      } else {
        saveLocal(rest);
      }
      return rest;
    });
  }, []);

  /* ── Clear all ── */
  const clearPins = useCallback(async () => {
    setPins([]);
    if (supabase) {
      await supabase.from('pins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } else {
      saveLocal([]);
    }
  }, []);

  return {
    pins,
    count: pins.length,
    loading,
    error,
    addPin,
    deleteLastPin,
    clearPins,
    isSupabase: !!supabase,
  };
}

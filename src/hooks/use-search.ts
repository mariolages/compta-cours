import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';

interface SearchOptions {
  table: string;
  columns: string[];
  limit?: number;
}

export const useSearch = <T extends Record<string, any>>({ 
  table, 
  columns, 
  limit = 10 
}: SearchOptions) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let supabaseQuery = supabase
        .from(table)
        .select('*')
        .limit(limit);

      // Ajouter des conditions de recherche pour chaque colonne
      columns.forEach((column) => {
        supabaseQuery = supabaseQuery.or(`${column}.ilike.%${searchQuery}%`);
      });

      const { data, error: searchError } = await supabaseQuery;

      if (searchError) throw searchError;
      setResults(data || []);
    } catch (err) {
      console.error('Erreur de recherche:', err);
      setError('Une erreur est survenue lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  }, [table, columns, limit]);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  };
};
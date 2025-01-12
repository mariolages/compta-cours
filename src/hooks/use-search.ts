import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types/tables';

interface SearchOptions<T extends keyof Tables> {
  table: T;
  columns: (keyof Tables[T]['Row'])[];
  limit?: number;
}

export const useSearch = <T extends keyof Tables>({ 
  table, 
  columns, 
  limit = 10 
}: SearchOptions<T>) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tables[T]['Row'][]>([]);
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

      columns.forEach((column) => {
        supabaseQuery = supabaseQuery.or(`${String(column)}.ilike.%${searchQuery}%`);
      });

      const { data, error: searchError } = await supabaseQuery;

      if (searchError) throw searchError;
      
      // Utilisation d'une double assertion pour contourner l'erreur de typage
      // Nous savons que les données correspondent au type attendu
      setResults((data || []) as unknown as Tables[T]['Row'][]);
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
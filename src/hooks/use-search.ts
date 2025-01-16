import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface SearchOptions {
  table: keyof Database['public']['Tables'];
  columns: string[];
  limit?: number;
}

export const useSearch = ({ 
  table, 
  columns, 
  limit = 10 
}: SearchOptions) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
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
      let query = supabase
        .from(table)
        .select('*')
        .limit(limit);

      // Add search conditions for each column
      columns.forEach((column, index) => {
        if (index === 0) {
          query = query.ilike(column, `%${searchQuery}%`);
        } else {
          query = query.or(`${column}.ilike.%${searchQuery}%`);
        }
      });

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching');
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
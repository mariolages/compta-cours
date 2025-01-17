import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { File, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  files: Array<{
    id: string;
    title: string;
    subject: {
      name: string;
      code: string;
    };
  }>;
  subjects: Array<{
    id: number;
    code: string;
    name: string;
    class_id: number;
    created_at: string;
  }>;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Écouter le raccourci clavier Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ['global-search', search],
    queryFn: async () => {
      if (!search.trim()) return { files: [], subjects: [] };

      const [filesResult, subjectsResult] = await Promise.all([
        supabase
          .from('files')
          .select(`
            id,
            title,
            subject:subject_id(name, code)
          `)
          .ilike('title', `%${search}%`)
          .limit(5),
        supabase
          .from('subjects')
          .select('*')
          .or(`name.ilike.%${search}%,code.ilike.%${search}%`)
          .limit(5)
      ]);

      if (filesResult.error) throw filesResult.error;
      if (subjectsResult.error) throw subjectsResult.error;

      return {
        files: filesResult.data || [],
        subjects: subjectsResult.data || []
      };
    },
    enabled: search.length > 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const handleSelect = (type: 'file' | 'subject', id: string | number) => {
    setOpen(false);
    if (type === 'file') {
      // Naviguer vers le fichier
      navigate(`/subjects/${id}`);
    } else {
      // Naviguer vers la matière
      navigate(`/subjects/${id}`);
    }
    toast({
      title: "Navigation",
      description: "Redirection en cours...",
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Rechercher...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Rechercher des fichiers, matières..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <AnimatePresence>
                {searchResults?.files?.length > 0 && (
                  <CommandGroup heading="Fichiers">
                    {searchResults.files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <CommandItem
                          value={file.title}
                          onSelect={() => handleSelect('file', file.id)}
                          className="flex items-center gap-2 p-2"
                        >
                          <File className="w-4 h-4" />
                          <div>
                            <p>{file.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.subject?.name} ({file.subject?.code})
                            </p>
                          </div>
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                )}

                {searchResults?.subjects?.length > 0 && (
                  <CommandGroup heading="Matières">
                    {searchResults.subjects.map((subject) => (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <CommandItem
                          value={subject.name}
                          onSelect={() => handleSelect('subject', subject.id)}
                          className="flex items-center gap-2 p-2"
                        >
                          <File className="w-4 h-4" />
                          <div>
                            <p>{subject.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {subject.code}
                            </p>
                          </div>
                        </CommandItem>
                      </motion.div>
                    ))}
                  </CommandGroup>
                )}
              </AnimatePresence>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
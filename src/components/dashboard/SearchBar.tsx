import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [open, setOpen] = useState(false);

  const suggestions = [
    { type: 'type', label: 'Cours' },
    { type: 'type', label: 'QCM' },
    { type: 'type', label: 'Exercices' },
    { type: 'subject', label: 'Comptabilité' },
    { type: 'subject', label: 'Droit Fiscal' },
    { type: 'subject', label: 'Finance' },
    { type: 'recent', label: 'Chapitre 1' },
    { type: 'recent', label: 'Chapitre 2' },
    { type: 'recent', label: 'Chapitre 3' },
  ];

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-2xl">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Recherchez vos ressources : cours, QCM, sujets d'examen..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
              onClick={() => setOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Exemple : 'Chapitre 3 Comptabilité' ou 'QCM Droit Fiscal'" />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup heading="Types de contenu">
                {suggestions
                  .filter((s) => s.type === 'type')
                  .map((suggestion) => (
                    <CommandItem
                      key={suggestion.label}
                      onSelect={() => handleSelect(suggestion.label)}
                    >
                      {suggestion.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Matières">
                {suggestions
                  .filter((s) => s.type === 'subject')
                  .map((suggestion) => (
                    <CommandItem
                      key={suggestion.label}
                      onSelect={() => handleSelect(suggestion.label)}
                    >
                      {suggestion.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Recherches récentes">
                {suggestions
                  .filter((s) => s.type === 'recent')
                  .map((suggestion) => (
                    <CommandItem
                      key={suggestion.label}
                      onSelect={() => handleSelect(suggestion.label)}
                    >
                      {suggestion.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
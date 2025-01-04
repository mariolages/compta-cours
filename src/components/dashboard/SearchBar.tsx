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
    { type: 'type', label: 'Cours', description: 'Tous les cours disponibles' },
    { type: 'type', label: 'QCM', description: 'Tous les QCM interactifs' },
    { type: 'type', label: 'Exercices', description: 'Tous les exercices corrigés' },
    { type: 'subject', label: 'Comptabilité', description: 'Cours et exercices de comptabilité' },
    { type: 'subject', label: 'Droit Fiscal', description: 'Cours et exercices de droit fiscal' },
    { type: 'subject', label: 'Finance', description: 'Cours et exercices de finance' },
  ];

  const handleSelect = (selectedValue: string) => {
    // Si on sélectionne un type de contenu (Cours, QCM, Exercices)
    // on remplace complètement la recherche actuelle
    if (suggestions.find(s => s.type === 'type' && s.label === selectedValue)) {
      onChange(selectedValue);
      setOpen(false);
      return;
    }
    
    // Pour les autres sélections, on ajoute à la recherche existante
    const currentTerms = value.toLowerCase().split(' ').filter(Boolean);
    const newTerm = selectedValue.toLowerCase();
    
    if (!currentTerms.includes(newTerm)) {
      const newValue = currentTerms.length > 0 
        ? `${value.trim()} ${selectedValue}`
        : selectedValue;
      onChange(newValue);
    }
    
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
                      className="flex justify-between items-center cursor-pointer"
                    >
                      <span>{suggestion.label}</span>
                      <span className="text-xs text-gray-500">{suggestion.description}</span>
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
                      className="flex justify-between items-center cursor-pointer"
                    >
                      <span>{suggestion.label}</span>
                      <span className="text-xs text-gray-500">{suggestion.description}</span>
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
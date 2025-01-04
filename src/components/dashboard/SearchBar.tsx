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
              className="w-full pl-10 pr-4 py-2 h-12 text-lg"
              onClick={() => setOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Tapez 'Chapitre' suivi d'un numéro ou sélectionnez un type" 
              className="h-12"
            />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup heading="Types de contenu" className="p-2">
                {suggestions
                  .filter((s) => s.type === 'type')
                  .map((suggestion) => (
                    <CommandItem
                      key={suggestion.label}
                      onSelect={() => handleSelect(suggestion.label)}
                      className="flex justify-between items-center p-3 cursor-pointer hover:bg-primary hover:text-white rounded-lg transition-colors"
                    >
                      <span className="text-lg font-medium">{suggestion.label}</span>
                      <span className="text-sm text-gray-500">{suggestion.description}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
              <CommandGroup heading="Matières" className="p-2">
                {suggestions
                  .filter((s) => s.type === 'subject')
                  .map((suggestion) => (
                    <CommandItem
                      key={suggestion.label}
                      onSelect={() => handleSelect(suggestion.label)}
                      className="flex justify-between items-center p-3 cursor-pointer hover:bg-primary hover:text-white rounded-lg transition-colors"
                    >
                      <span className="text-lg font-medium">{suggestion.label}</span>
                      <span className="text-sm text-gray-500">{suggestion.description}</span>
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
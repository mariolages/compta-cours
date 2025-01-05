import React from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from "@/integrations/supabase/client";
import { FileTableHeader } from './FileTableHeader';
import { FileTableRow } from './FileTableRow';
import { EmptyFileList } from './EmptyFileList';
import type { File } from '@/types/files';

interface RecentFilesProps {
  files: File[];
  searchQuery: string;
  onDelete: (fileId: string) => void;
}

const exactMatches = ["Cours", "QCM", "Exercices"];

export const RecentFiles = ({ files, searchQuery, onDelete }: RecentFilesProps) => {
  const { toast } = useToast();
  
  const filteredFiles = files.filter((file) => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase().trim();
    const fileTitle = file.title.toLowerCase();
    const fileSubject = `${file.subject.code} ${file.subject.name}`.toLowerCase();
    const fileCategory = file.category.name.toLowerCase();
    
    // Debug logs améliorés
    console.log('------- Search Debug -------');
    console.log('Search query:', searchLower);
    console.log('File details:', {
      title: fileTitle,
      subject: fileSubject,
      category: fileCategory,
      subjectCode: file.subject.code.toLowerCase(),
      subjectName: file.subject.name.toLowerCase()
    });
    
    // Recherche exacte de catégorie
    if (exactMatches.includes(searchQuery)) {
      const isMatch = fileCategory === searchQuery.toLowerCase();
      console.log('Category exact match:', isMatch);
      return isMatch;
    }
    
    // Recherche d'UE (plus flexible)
    if (searchLower.includes('ue')) {
      const ueNumber = searchLower.match(/\d+/)?.[0];
      if (ueNumber) {
        const isMatch = fileSubject.includes(`ue${ueNumber}`) || 
                       file.subject.code.toLowerCase().includes(`ue${ueNumber}`) ||
                       file.subject.name.toLowerCase().includes(`ue${ueNumber}`);
        console.log('UE match:', isMatch, 'UE number:', ueNumber);
        return isMatch;
      }
    }
    
    // Recherche de code matière (plus flexible)
    if (/^[a-z]+\d+$/i.test(searchLower)) {
      const isMatch = file.subject.code.toLowerCase().includes(searchLower) ||
                     fileSubject.includes(searchLower);
      console.log('Subject code match:', isMatch);
      return isMatch;
    }
    
    // Recherche de chapitre (plus flexible)
    if (searchLower.includes('chapitre') || searchLower.includes('chap') || searchLower.includes('ch')) {
      const numberMatch = searchLower.match(/\d+/);
      if (numberMatch) {
        const chapterNumber = numberMatch[0];
        console.log('Looking for chapter:', chapterNumber);
        
        const patterns = [
          new RegExp(`chapitre\\s*${chapterNumber}\\b`, 'i'),
          new RegExp(`chap\\.?\\s*${chapterNumber}\\b`, 'i'),
          new RegExp(`ch\\.?\\s*${chapterNumber}\\b`, 'i')
        ];
        
        const isMatch = patterns.some(pattern => {
          const matches = pattern.test(fileTitle);
          console.log('Testing pattern:', pattern, 'Result:', matches);
          return matches;
        });
        
        return isMatch;
      }
    }
    
    // Recherche générale (plus flexible)
    const searchTerms = searchLower.split(/\s+/);
    const isMatch = searchTerms.every(term => 
      fileTitle.includes(term) || 
      fileSubject.includes(term) || 
      fileCategory.includes(term) ||
      file.subject.code.toLowerCase().includes(term) ||
      file.subject.name.toLowerCase().includes(term)
    );
    console.log('General search match:', isMatch);
    return isMatch;
  });

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      onDelete(fileId);
      toast({
        title: "Succès",
        description: "Le fichier a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
      });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
        {searchQuery && exactMatches.includes(searchQuery) 
          ? `${searchQuery} (${filteredFiles.length})`
          : `Fichiers récents ${searchQuery ? `(${filteredFiles.length} résultats)` : ''}`
        }
      </h2>
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <FileTableHeader />
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.length === 0 ? (
                  <EmptyFileList searchQuery={searchQuery} />
                ) : (
                  filteredFiles.map((file) => (
                    <FileTableRow
                      key={file.id}
                      file={file}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
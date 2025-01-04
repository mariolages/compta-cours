import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
    
    // Si la recherche est exactement "Cours", "QCM" ou "Exercices"
    if (exactMatches.includes(searchQuery)) {
      return file.category.name.toLowerCase() === searchQuery.toLowerCase();
    }
    
    // Convertit la recherche en minuscules et divise en mots
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    
    // Prépare les données du fichier pour la recherche
    const fileData = {
      title: file.title.toLowerCase(),
      subject: `${file.subject.code} ${file.subject.name}`.toLowerCase(),
      category: file.category.name.toLowerCase(),
    };
    
    // Recherche spécifique pour "Chapitre X"
    const chapterSearch = searchTerms.join(' ').match(/chapitre\s*(\d+)/i);
    if (chapterSearch) {
      const chapterNumber = chapterSearch[1];
      return fileData.title.includes(`chapitre ${chapterNumber}`) || 
             fileData.title.includes(`chapitre${chapterNumber}`);
    }
    
    // Recherche normale dans tous les champs
    return searchTerms.every(term => 
      Object.values(fileData).some(value => value.includes(term))
    );
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
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Nom du fichier
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-lg font-medium">
                          {searchQuery 
                            ? `Aucun fichier trouvé pour "${searchQuery}"`
                            : "Aucun fichier disponible"}
                        </p>
                        <p className="text-sm text-gray-400">
                          Essayez une recherche différente ou ajoutez de nouveaux fichiers
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {file.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {file.subject.code} - {file.subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-3 py-1 rounded-full bg-primary-light text-primary">
                          {file.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-primary-hover hover:bg-primary-light"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
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
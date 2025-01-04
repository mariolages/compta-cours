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

export const RecentFiles = ({ files, searchQuery, onDelete }: RecentFilesProps) => {
  const { toast } = useToast();
  
  const filteredFiles = files.filter((file) => {
    if (!searchQuery.trim()) return true;
    
    // Si la recherche est exactement "Cours", "QCM" ou "Exercices"
    const exactMatches = ["Cours", "QCM", "Exercices"];
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
    
    // Vérifie si tous les termes de recherche sont présents
    return searchTerms.every(term => {
      // Gère spécifiquement la recherche de chapitres
      if (term.match(/^chapitre$/i)) {
        // Si le terme est "chapitre", cherche le prochain numéro
        const nextTerm = searchTerms[searchTerms.indexOf(term) + 1];
        if (nextTerm && /^\d+$/.test(nextTerm)) {
          return fileData.title.includes(`chapitre ${nextTerm}`) || 
                 fileData.title.includes(`chapitre${nextTerm}`);
        }
        return fileData.title.includes(term);
      }
      
      // Pour les termes comme "cours", "qcm", etc.
      if (["cours", "qcm", "exercices"].includes(term)) {
        return fileData.category.includes(term);
      }
      
      // Recherche normale dans tous les champs
      return Object.values(fileData).some(value => 
        value.includes(term.toLowerCase())
      );
    });
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
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom du fichier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {searchQuery 
                        ? `Aucun fichier trouvé pour "${searchQuery}"`
                        : "Aucun fichier disponible"}
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
                        {file.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
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
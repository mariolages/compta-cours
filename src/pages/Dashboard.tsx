import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, BookOpen, LogOut, Download, Search, User, Plus } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface File {
  id: string;
  title: string;
  subject: Subject;
  category: {
    name: string;
  };
  created_at: string;
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentFiles, setRecentFiles] = useState<File[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
    fetchRecentFiles();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
      });
      return;
    }
    navigate('/login');
  };

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('code');
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
      return;
    }
    
    setSubjects(data);
  };

  const fetchRecentFiles = async () => {
    const { data, error } = await supabase
      .from('files')
      .select(`
        id,
        title,
        created_at,
        subject:subject_id(id, code, name),
        category:category_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les fichiers récents",
      });
      return;
    }
    
    setRecentFiles(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                DCGHub
              </h1>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher des ressources..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Message */}
        <div className="glass-card rounded-xl p-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Bienvenue sur DCGHub !
              </h2>
              <p className="text-gray-600">
                Accédez à vos ressources et partagez vos fichiers avec la communauté.
              </p>
            </div>
            <BookOpen className="h-16 w-16 text-primary opacity-20" />
          </div>
        </div>

        {/* Recent Files Section */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
            Fichiers récents
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
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentFiles.map((file) => (
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
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-hover">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
            Matières
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Card 
                key={subject.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-[1.02]"
                onClick={() => navigate(`/subjects/${subject.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 group-hover:text-primary transition-colors">
                    <BookOpen className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                      <span className="text-primary">{subject.code}</span>
                      <span className="text-sm font-normal text-gray-600 group-hover:text-primary/80">
                        {subject.name}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Floating Upload Button */}
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary-hover transition-all duration-300 animate-fade-in"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <FileUploadDialog 
          open={isUploadOpen} 
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            fetchRecentFiles();
            setIsUploadOpen(false);
          }}
        />
      </div>
    </div>
  );
}
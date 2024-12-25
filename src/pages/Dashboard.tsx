import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, BookOpen, LogOut, Download } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tableau de bord DCG
          </h1>
          <div className="flex gap-4">
            <Button 
              onClick={() => setIsUploadOpen(true)} 
              className="bg-primary hover:bg-primary-hover transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              Déposer un fichier
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Recent Files Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Fichiers récents
          </h2>
          <div className="grid gap-4">
            {recentFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{file.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-primary">{file.subject.code}</span> - {file.subject.name} | {file.category.name}
                    </p>
                  </div>
                  <Button variant="outline" className="ml-4 hover:bg-primary/10">
                    <Download className="h-4 w-4" />
                    <span className="ml-2">Télécharger</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Matières
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Card 
                key={subject.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 hover:scale-[1.02]"
                onClick={() => navigate(`/subjects/${subject.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center group-hover:text-primary transition-colors">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                    <div>
                      <span className="text-primary">{subject.code}</span>
                      <span className="mx-2">-</span>
                      <span className="group-hover:text-primary transition-colors">{subject.name}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

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
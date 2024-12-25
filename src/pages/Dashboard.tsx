import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, BookOpen, LogOut } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord DCG</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsUploadOpen(true)} className="bg-primary">
            <Upload className="mr-2 h-4 w-4" />
            Déposer un fichier
          </Button>
          <Button onClick={handleLogout} variant="outline" className="text-red-500 hover:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Fichiers récents</h2>
        <div className="grid gap-4">
          {recentFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-medium">{file.title}</h3>
                  <p className="text-sm text-gray-500">
                    {file.subject.code} - {file.subject.name} | {file.category.name}
                  </p>
                </div>
                <Button variant="outline">Télécharger</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Matières</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card 
              key={subject.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/subjects/${subject.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  <div>
                    <span className="text-primary">{subject.code}</span> - {subject.name}
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
  );
}

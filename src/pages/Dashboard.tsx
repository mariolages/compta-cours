import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { RecentFiles } from '@/components/dashboard/RecentFiles';
import { ProfileMenu } from '@/components/dashboard/ProfileMenu';
import type { Subject, File } from '@/types/files';

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
            
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <div className="flex items-center gap-4">
              <ProfileMenu />
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
        <RecentFiles files={recentFiles} searchQuery={searchQuery} />

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
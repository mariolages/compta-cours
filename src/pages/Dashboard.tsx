import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, RefreshCw, Clock } from "lucide-react";
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard mounted, fetching initial data");
    fetchSubjects();
    fetchRecentFiles();
  }, []);

  const fetchSubjects = async () => {
    console.log("Fetching subjects...");
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('code');
    
    if (error) {
      console.error("Error fetching subjects:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
      return;
    }
    
    console.log("Subjects fetched successfully:", data);
    setSubjects(data);
  };

  const fetchRecentFiles = async () => {
    console.log("Fetching recent files...");
    const { data, error } = await supabase
      .from('files')
      .select(`
        id,
        title,
        created_at,
        subject:subjects(id, code, name),
        category:categories(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error("Error fetching recent files:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les fichiers récents",
      });
      return;
    }
    
    console.log("Recent files fetched successfully:", data);
    setRecentFiles(data);
  };

  const handleDeleteFile = async (fileId: string) => {
    console.log("Deleting file:", fileId);
    setRecentFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const refreshData = async () => {
    console.log("Refreshing all data...");
    setIsRefreshing(true);
    await Promise.all([fetchSubjects(), fetchRecentFiles()]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast({
      title: "Mise à jour effectuée",
      description: "Les données ont été actualisées",
    });
  };

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
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
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshData}
                disabled={isRefreshing}
                className="relative"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
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
              <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>
                  Dernière actualisation : {lastRefresh.toLocaleTimeString('fr-FR')}
                </span>
              </div>
            </div>
            <BookOpen className="h-16 w-16 text-primary opacity-20" />
          </div>
        </div>

        {/* Recent Files Section */}
        <RecentFiles 
          files={recentFiles} 
          searchQuery={searchQuery} 
          onDelete={handleDeleteFile}
        />

        {/* Subjects Grid */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
            Matières
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Button
                key={subject.id}
                variant="ghost"
                className="p-0 h-auto w-full hover:bg-transparent"
                onClick={() => handleSubjectClick(subject.id)}
              >
                <Card className="w-full group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 group-hover:text-primary transition-colors">
                      <BookOpen className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col flex-1">
                        <span className="text-primary">{subject.code}</span>
                        <span className="text-sm font-normal text-gray-600 group-hover:text-primary/80">
                          {subject.name}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Button>
            ))}
          </div>
        </div>

        {/* Upload Dialog */}
        <FileUploadDialog 
          open={isUploadOpen} 
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            fetchRecentFiles();
            setIsUploadOpen(false);
          }}
        />

        {/* Floating Upload Button */}
        <Button
          onClick={() => setIsUploadOpen(true)}
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary-hover transition-all duration-300 animate-fade-in"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

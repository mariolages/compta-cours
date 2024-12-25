import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, RefreshCw, Clock, FileText } from "lucide-react";
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
  const [fileCountBySubject, setFileCountBySubject] = useState<Record<number, number>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
    fetchRecentFiles();
    fetchFileCountBySubject();
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

  const fetchFileCountBySubject = async () => {
    const { data, error } = await supabase
      .from('files')
      .select('subject_id, count')
      .select('subject_id');

    if (error) {
      console.error('Error fetching file counts:', error);
      return;
    }

    const counts: Record<number, number> = {};
    data.forEach(file => {
      counts[file.subject_id] = (counts[file.subject_id] || 0) + 1;
    });
    setFileCountBySubject(counts);
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

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchSubjects(),
      fetchRecentFiles(),
      fetchFileCountBySubject()
    ]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast({
      title: "Mise à jour effectuée",
      description: "Les données ont été actualisées",
    });
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
                    <div className="flex flex-col flex-1">
                      <span className="text-primary">{subject.code}</span>
                      <span className="text-sm font-normal text-gray-600 group-hover:text-primary/80">
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <FileText className="h-4 w-4" />
                      <span>{fileCountBySubject[subject.id] || 0}</span>
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
            fetchFileCountBySubject();
            setIsUploadOpen(false);
          }}
        />
      </div>
    </div>
  );
}
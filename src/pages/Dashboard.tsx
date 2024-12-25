import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw } from "lucide-react";
import { FileUploadDialog } from '@/components/dashboard/FileUploadDialog';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { ProfileMenu } from '@/components/dashboard/ProfileMenu';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { SubjectsGrid } from '@/components/dashboard/SubjectsGrid';
import type { Subject } from '@/types/files';

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dashboard mounted, fetching initial data");
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    console.log("Fetching subjects...");
    const { data, error } = await supabase
      .from('subjects')
      .select('*');
    
    if (error) {
      console.error("Error fetching subjects:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les matières",
      });
      return;
    }
    
    // Sort subjects by extracting the UE number and comparing numerically
    const sortedData = data.sort((a, b) => {
      const numA = parseInt(a.code.match(/\d+/)[0]);
      const numB = parseInt(b.code.match(/\d+/)[0]);
      return numA - numB;
    });
    
    console.log("Subjects fetched and sorted successfully:", sortedData);
    setSubjects(sortedData);
  };

  const refreshData = async () => {
    console.log("Refreshing all data...");
    setIsRefreshing(true);
    await fetchSubjects();
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                compta-cours.fr
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
        <WelcomeCard lastRefresh={lastRefresh} />
        <SubjectsGrid subjects={subjects} onSubjectClick={handleSubjectClick} />

        {/* Upload Dialog */}
        <FileUploadDialog 
          open={isUploadOpen} 
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
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

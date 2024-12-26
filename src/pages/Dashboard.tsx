import { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('subjects')
        .select(`
          id,
          code,
          name,
          created_at,
          files (
            id,
            title,
            created_at,
            file_path,
            category_id,
            category:categories(
              id,
              name
            )
          )
        `)
        .order('code');
      
      if (error) {
        console.error("Error fetching subjects:", error);
        throw error;
      }
      
      // Filter to only include UE1 to UE14 and sort them numerically
      return data
        .filter(subject => /^UE\d+$/.test(subject.code))
        .filter(subject => {
          const num = parseInt(subject.code.slice(2));
          return num >= 1 && num <= 14;
        })
        .sort((a, b) => {
          const numA = parseInt(a.code.slice(2));
          const numB = parseInt(b.code.slice(2));
          return numA - numB;
        });
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Handle error outside of the query configuration
  if (error) {
    console.error("Query error:", error);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de charger les matières",
    });
  }

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                onClick={() => window.location.reload()}
                className="relative"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <WelcomeCard lastRefresh={lastRefresh} />
        <SubjectsGrid subjects={subjects} onSubjectClick={handleSubjectClick} />

        <FileUploadDialog 
          open={isUploadOpen} 
          onOpenChange={setIsUploadOpen}
          onSuccess={() => {
            setIsUploadOpen(false);
          }}
        />

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
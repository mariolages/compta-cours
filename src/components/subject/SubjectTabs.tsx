import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, CheckSquare, Archive, CheckCircle, Headphones } from "lucide-react";
import { FileList } from "./FileList";

interface SubjectTabsProps {
  files: any;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
}

export function SubjectTabs({ files, selectedCategory, onCategoryChange, onDownload }: SubjectTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <Tabs defaultValue={selectedCategory} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start gap-4 bg-gray-50/50 p-4 rounded-lg mb-8">
          <TabsTrigger value="1" className="flex items-center gap-2 px-4 py-2">
            <BookOpen className="h-4 w-4" />
            Cours
          </TabsTrigger>
          <TabsTrigger value="2" className="flex items-center gap-2 px-4 py-2">
            <FileText className="h-4 w-4" />
            Exercices
          </TabsTrigger>
          <TabsTrigger value="3" className="flex items-center gap-2 px-4 py-2">
            <CheckSquare className="h-4 w-4" />
            Corrections d'exercices
          </TabsTrigger>
          <TabsTrigger value="4" className="flex items-center gap-2 px-4 py-2">
            <Archive className="h-4 w-4" />
            Sujets d'examen
          </TabsTrigger>
          <TabsTrigger value="5" className="flex items-center gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4" />
            Corrections de sujets
          </TabsTrigger>
          <TabsTrigger value="6" className="flex items-center gap-2 px-4 py-2">
            <Headphones className="h-4 w-4" />
            Podcasts
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {["1", "2", "3", "4", "5", "6"].map((categoryId) => (
            <TabsContent 
              key={categoryId} 
              value={categoryId} 
              className="focus-visible:outline-none focus-visible:ring-0"
            >
              <FileList files={files} onDownload={onDownload} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
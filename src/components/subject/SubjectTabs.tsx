import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, CheckSquare, Archive, CheckCircle, Headphones, BrainCircuit } from "lucide-react";
import { FileList } from "./FileList";
import { QuizList } from "./QuizList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubjectTabsProps {
  files: any;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onDownload: (fileId: string, filePath: string, fileName: string) => void;
  isMobile?: boolean;
}

const categories = [
  { id: "1", title: "Cours", icon: BookOpen },
  { id: "2", title: "Exercices", icon: FileText },
  { id: "3", title: "Corrections d'exercices", icon: CheckSquare },
  { id: "4", title: "Sujets d'examen", icon: Archive },
  { id: "5", title: "Corrections de sujets", icon: CheckCircle },
  { id: "6", title: "Podcasts", icon: Headphones },
  { id: "7", title: "Quiz", icon: BrainCircuit },
];

export function SubjectTabs({ files, selectedCategory, onCategoryChange, onDownload, isMobile }: SubjectTabsProps) {
  if (isMobile) {
    return (
      <div className="space-y-6">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full bg-white border-2 border-gray-200 shadow-sm">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border-2 border-gray-200 z-50">
            {categories.map((category) => (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className="py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <category.icon className="h-5 w-5 text-primary" />
                  <span className="text-base">{category.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="bg-white rounded-xl shadow-sm p-4">
          {selectedCategory === "7" ? (
            <QuizList files={files} />
          ) : (
            <FileList files={files} onDownload={onDownload} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
      <Tabs defaultValue={selectedCategory} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start gap-4 bg-gray-50/50 p-4 rounded-lg mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <category.icon className="h-4 w-4" />
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          {categories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="focus-visible:outline-none focus-visible:ring-0"
            >
              {category.id === "7" ? (
                <QuizList files={files} />
              ) : (
                <FileList files={files} onDownload={onDownload} />
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
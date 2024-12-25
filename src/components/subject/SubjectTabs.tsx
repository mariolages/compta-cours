import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, CheckSquare, Archive, CheckCircle, Headphones } from "lucide-react";
import { FileList } from "./FileList";
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
];

export function SubjectTabs({ files, selectedCategory, onCategoryChange, onDownload, isMobile }: SubjectTabsProps) {
  if (isMobile) {
    return (
      <div className="space-y-6">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <span>{category.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
          <FileList files={files} onDownload={onDownload} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      <Tabs defaultValue={selectedCategory} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start gap-4 bg-gray-50/50 p-4 rounded-lg mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2 px-4 py-2"
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
              <FileList files={files} onDownload={onDownload} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
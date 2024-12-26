import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subject } from "@/types/subject";

interface SubjectsGridProps {
  subjects: Subject[];
  onSubjectClick: (subjectId: number) => void;
}

export const SubjectsGrid = ({ subjects, onSubjectClick }: SubjectsGridProps) => {
  // Filter and sort subjects to only show UE1 to UE14 in ascending order
  const sortedSubjects = subjects
    .filter(subject => {
      const ueNumber = parseInt(subject.code.replace('UE', ''));
      return ueNumber >= 1 && ueNumber <= 14;
    })
    .sort((a, b) => {
      const ueNumberA = parseInt(a.code.replace('UE', ''));
      const ueNumberB = parseInt(b.code.replace('UE', ''));
      return ueNumberA - ueNumberB;
    });

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
        Matières
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedSubjects.map((subject) => (
          <Button
            key={subject.id}
            variant="ghost"
            className="p-0 h-auto w-full hover:bg-transparent"
            onClick={() => onSubjectClick(subject.id)}
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
  );
}
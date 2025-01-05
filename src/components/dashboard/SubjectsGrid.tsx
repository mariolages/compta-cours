import { BookOpen, Scale, ChartBar, Briefcase, Computer, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subject } from "@/types/subject";

interface SubjectsGridProps {
  subjects: Subject[];
  onSubjectClick: (subjectId: number) => void;
}

export const SubjectsGrid = ({ subjects, onSubjectClick }: SubjectsGridProps) => {
  const getSubjectIcon = (code: string) => {
    if (code.startsWith('UE1') || code.startsWith('UE2') || code.startsWith('UE3') || code.startsWith('UE4') || code.startsWith('DRT')) {
      return Scale;
    }
    if (code.startsWith('UE5') || code.startsWith('UE6') || code.startsWith('ECO')) {
      return ChartBar;
    }
    if (code.startsWith('UE7') || code.startsWith('MGT')) {
      return Briefcase;
    }
    if (code.startsWith('UE8') || code.startsWith('BLK5')) {
      return Computer;
    }
    if (code.startsWith('UE9') || code.startsWith('UE10') || code.startsWith('UE11') || code.startsWith('CPT') || code.startsWith('BLK')) {
      return Calculator;
    }
    return BookOpen;
  };

  const sortedSubjects = [...subjects].sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold text-[#FAFAF8] pl-4 border-l-4 border-[#61AAF2]">
        Matières
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedSubjects.map((subject) => {
          const Icon = getSubjectIcon(subject.code);
          return (
            <Button
              key={subject.id}
              variant="ghost"
              className="p-0 h-auto w-full hover:bg-transparent group"
              onClick={() => onSubjectClick(subject.id)}
            >
              <Card className="w-full group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[#ffffff0a] to-[#ffffff14] border-[#ffffff1a] hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#61AAF2]/5 via-[#8989DE]/5 to-[#EBDBBC]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 relative">
                    <Icon className="h-5 w-5 text-[#61AAF2] group-hover:scale-110 transition-transform duration-300" />
                    <div className="flex flex-col flex-1">
                      <span className="text-[#FAFAF8] group-hover:text-[#61AAF2] transition-colors">
                        {subject.code}
                      </span>
                      <span className="text-sm font-normal text-[#FAFAF8]/60 group-hover:text-[#FAFAF8]/80">
                        {subject.name}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
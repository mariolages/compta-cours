import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { Class } from "@/types/class";

interface ClassesGridProps {
  classes: Class[];
  onClassClick: (classId: number) => void;
}

export const ClassesGrid = ({ classes, onClassClick }: ClassesGridProps) => {
  const groupedClasses = classes.reduce((acc, cls) => {
    const type = cls.code.startsWith('DCG') ? 'DCG' : 'BTS';
    if (!acc[type]) acc[type] = [];
    acc[type].push(cls);
    return acc;
  }, {} as Record<string, Class[]>);

  return (
    <div className="space-y-8 animate-fade-in">
      {Object.entries(groupedClasses).map(([type, typeClasses]) => (
        <div key={type} className="space-y-4">
          <h2 className="text-2xl font-semibold text-white pl-4 border-l-4 border-primary">
            {type}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typeClasses.map((cls) => (
              <Button
                key={cls.id}
                variant="ghost"
                className="p-0 h-auto w-full hover:bg-transparent group"
                onClick={() => onClassClick(cls.id)}
              >
                <Card 
                  className="w-full group relative overflow-hidden bg-secondary/50 hover:bg-secondary/70 backdrop-blur-xl border-white/10 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 relative">
                      <GraduationCap 
                        className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" 
                      />
                      <div className="flex flex-col flex-1">
                        <span className="text-white group-hover:text-primary transition-colors">
                          {cls.code}
                        </span>
                        <span className="text-sm font-normal text-gray-300 group-hover:text-white/90">
                          {cls.name}
                        </span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
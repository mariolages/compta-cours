import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { Class } from "@/types/class";

interface ClassesGridProps {
  classes: Class[];
  onClassClick: (classId: number) => void;
}

export const ClassesGrid = ({ classes, onClassClick }: ClassesGridProps) => {
  // Group classes by type (DCG or BTS)
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
          <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
            {type}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typeClasses.map((cls) => (
              <Button
                key={cls.id}
                variant="ghost"
                className="p-0 h-auto w-full hover:bg-transparent"
                onClick={() => onClassClick(cls.id)}
              >
                <Card 
                  className="w-full group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-[1.02]"
                  style={{ borderColor: cls.color }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 group-hover:text-primary transition-colors">
                      <GraduationCap 
                        className="h-5 w-5 transition-transform" 
                        style={{ color: cls.color }}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="text-primary">{cls.code}</span>
                        <span className="text-sm font-normal text-gray-600 group-hover:text-primary/80">
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
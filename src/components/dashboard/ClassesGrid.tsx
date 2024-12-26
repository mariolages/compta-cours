import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

interface Class {
  id: number;
  name: string;
  code: string;
  color: string;
}

interface ClassesGridProps {
  classes: Class[];
  onClassClick: (classId: number) => void;
}

export const ClassesGrid = ({ classes, onClassClick }: ClassesGridProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary">
        Sélectionnez votre classe
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((classItem) => (
          <Button
            key={classItem.id}
            variant="ghost"
            className="p-0 h-auto w-full hover:bg-transparent"
            onClick={() => onClassClick(classItem.id)}
          >
            <Card 
              className="w-full group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm hover:bg-white transform hover:scale-[1.02]"
              style={{ 
                borderColor: classItem.color,
                borderWidth: '2px'
              }}
            >
              <CardHeader>
                <CardTitle 
                  className="flex items-center gap-3 group-hover:text-primary transition-colors"
                  style={{ color: classItem.color }}
                >
                  <GraduationCap 
                    className="h-5 w-5 transition-transform" 
                    style={{ color: classItem.color }}
                  />
                  <div className="flex flex-col flex-1">
                    <span style={{ color: classItem.color }}>{classItem.code}</span>
                    <span className="text-sm font-normal text-gray-600">
                      {classItem.name}
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
};
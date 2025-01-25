import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import type { Class } from "@/types/class";

interface ClassSelectorProps {
  classes: Class[];
  selectedClassId: number | null;
  onClassChange: (classId: string) => void;
}

export const ClassSelector = ({ classes, selectedClassId, onClassChange }: ClassSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-primary/10 hover:border-primary/20 transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Votre classe</h3>
              <p className="text-sm text-gray-600">Sélectionnez votre classe pour voir le contenu adapté</p>
            </div>
          </div>
          
          <Select 
            value={selectedClassId?.toString() || ""} 
            onValueChange={onClassChange}
          >
            <SelectTrigger className="w-full bg-white border-2 border-gray-100 hover:border-primary/20 transition-all">
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent className="bg-white border-2 border-gray-100">
              {classes.map((cls) => (
                <SelectItem 
                  key={cls.id} 
                  value={cls.id.toString()}
                  className="cursor-pointer hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cls.color }}
                    />
                    <span>{cls.code} - {cls.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </motion.div>
  );
};
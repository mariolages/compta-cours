import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {Object.entries(groupedClasses).map(([type, typeClasses]) => (
        <div key={type} className="space-y-4">
          <motion.h2 
            className="text-2xl font-semibold text-gray-800 pl-2 border-l-4 border-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {type}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typeClasses.map((cls) => (
              <motion.div
                key={cls.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className="p-0 h-auto w-full hover:bg-transparent"
                  onClick={() => onClassClick(cls.id)}
                >
                  <Card 
                    className="w-full group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-2"
                    style={{ borderColor: `${cls.color}20`, borderLeftColor: cls.color, borderLeftWidth: '4px' }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 group-hover:text-primary transition-colors">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <GraduationCap 
                            className="h-5 w-5 transition-transform" 
                            style={{ color: cls.color }}
                          />
                        </motion.div>
                        <div className="flex flex-col flex-1">
                          <span className="text-primary font-bold">{cls.code}</span>
                          <span className="text-sm font-normal text-gray-600 group-hover:text-primary/80">
                            {cls.name}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};
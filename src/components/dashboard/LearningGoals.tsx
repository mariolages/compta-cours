import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Goal {
  id: string;
  title: string;
  completed: boolean;
  target_date: string;
}

interface LearningGoalsProps {
  goals: Goal[];
  onToggleGoal: (id: string) => void;
  onAddGoal?: () => void;
}

export const LearningGoals = ({ goals, onToggleGoal, onAddGoal }: LearningGoalsProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Objectifs d'apprentissage</CardTitle>
          <Button variant="outline" size="sm" onClick={onAddGoal}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-muted-foreground">Aucun objectif défini</p>
            </motion.div>
          ) : (
            <ul className="space-y-4">
              {goals.map((goal) => (
                <motion.li
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center space-x-4"
                >
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={() => onToggleGoal(goal.id)}
                  />
                  <div className="flex-1">
                    <p className={`${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {goal.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date limite : {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
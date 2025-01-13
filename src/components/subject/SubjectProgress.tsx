import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SubjectProgressProps {
  subject: {
    name: string;
  };
}

export const SubjectProgress = ({ subject }: SubjectProgressProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Progression globale</span>
              <span>60%</span>
            </div>
            <Progress value={60} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
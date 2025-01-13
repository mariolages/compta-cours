import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SubjectQuizProps {
  subject: {
    name: string;
  };
}

export const SubjectQuiz = ({ subject }: SubjectQuizProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            Commencer un nouveau quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
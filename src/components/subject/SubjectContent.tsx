import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubjectContentProps {
  subject: {
    name: string;
    code: string;
  };
}

export const SubjectContent = ({ subject }: SubjectContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenu du cours {subject.code}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Contenu du cours {subject.name}</p>
      </CardContent>
    </Card>
  );
};
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubjectSidebarProps {
  subject: {
    name: string;
  };
}

export const SubjectSidebar = ({ subject }: SubjectSidebarProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-2">
          <a href="#" className="block hover:text-primary">Vue d'ensemble</a>
          <a href="#" className="block hover:text-primary">Chapitres</a>
          <a href="#" className="block hover:text-primary">Exercices</a>
          <a href="#" className="block hover:text-primary">Quiz</a>
        </nav>
      </CardContent>
    </Card>
  );
};
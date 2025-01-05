import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarPlus } from "lucide-react";

export function ExamCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('date');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleAddExam = async () => {
    if (!date || !title) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('exams')
        .insert([
          {
            title,
            description,
            date: date.toISOString(),
          },
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'examen a été ajouté avec succès",
      });

      setIsAddExamOpen(false);
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter l'examen",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Calendrier des examens</h2>
        <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Ajouter un examen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un examen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'examen"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description de l'examen"
                />
              </div>
              <Button onClick={handleAddExam}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={fr}
          modifiers={{
            booked: exams.map(exam => new Date(exam.date)),
          }}
          modifiersStyles={{
            booked: { backgroundColor: 'rgba(var(--primary), 0.1)' },
          }}
        />
      </div>

      <div className="space-y-2">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{exam.title}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(exam.date), "PPP", { locale: fr })}
              </p>
              {exam.description && (
                <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
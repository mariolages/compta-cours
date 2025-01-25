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
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarPlus, CalendarCheck, CalendarX, Calendar as CalendarIcon } from "lucide-react";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export function ExamCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useSessionContext();

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  const handleAddExam = async () => {
    if (!date || !title || !session?.user?.id) {
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
            user_id: session.user.id,
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

  const handleDeleteExam = async (examId: string) => {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'examen a été supprimé avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ['exams'] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'examen",
      });
    }
  };

  const selectedDayExams = exams.filter(exam => 
    date && isSameDay(new Date(exam.date), date)
  );

  return (
    <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-primary/5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Calendrier des examens
          </CardTitle>
          <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Ajouter un examen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Ajouter un examen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre de l'examen"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de l'examen"
                    className="mt-1"
                  />
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={fr}
                    className="rounded-md border"
                  />
                </div>
                <Button onClick={handleAddExam} className="w-full">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 divide-x divide-gray-100">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={fr}
              className="rounded-md border"
              modifiers={{
                booked: exams.map(exam => new Date(exam.date)),
              }}
              modifiersStyles={{
                booked: { 
                  backgroundColor: 'rgb(var(--primary) / 0.1)',
                  color: 'rgb(var(--primary))',
                  fontWeight: 'bold'
                },
              }}
            />
          </div>
          <div className="p-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-4">
              {date ? format(date, "d MMMM yyyy", { locale: fr }) : "Sélectionnez une date"}
            </h3>
            <AnimatePresence mode="wait">
              <div className="space-y-3">
                {selectedDayExams.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-gray-500 text-sm"
                  >
                    Aucun examen prévu pour cette date
                  </motion.p>
                ) : (
                  selectedDayExams.map((exam) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{exam.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(exam.date), "HH:mm", { locale: fr })}
                          </p>
                          {exam.description && (
                            <p className="text-sm text-gray-600 mt-2">{exam.description}</p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteExam(exam.id)}
                          className="h-8 w-8"
                        >
                          <CalendarX className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
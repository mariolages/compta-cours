import { BookOpen, Clock } from "lucide-react";

interface WelcomeCardProps {
  lastRefresh: Date;
}

export const WelcomeCard = ({ lastRefresh }: WelcomeCardProps) => {
  return (
    <div className="glass-card rounded-xl p-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue sur DCGHub !
          </h2>
          <p className="text-gray-600">
            Accédez à vos ressources et partagez vos fichiers avec la communauté.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Dernière actualisation : {lastRefresh.toLocaleTimeString('fr-FR')}
            </span>
          </div>
        </div>
        <BookOpen className="h-16 w-16 text-primary opacity-20" />
      </div>
    </div>
  );
};
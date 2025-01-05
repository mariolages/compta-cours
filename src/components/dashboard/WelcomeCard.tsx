import { BookOpen, Clock } from "lucide-react";

interface WelcomeCardProps {
  lastRefresh: Date;
}

export const WelcomeCard = ({ lastRefresh }: WelcomeCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#ffffff0a] to-[#ffffff14] backdrop-blur-xl border border-[#ffffff1a] shadow-2xl p-8 animate-fade-in group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#61AAF2]/10 via-[#8989DE]/10 to-[#EBDBBC]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#FAFAF8] mb-2">
            Bienvenue sur compta-cours
          </h2>
          <p className="text-[#FAFAF8]/80">
            Accédez à vos ressources et partagez vos fichiers avec la communauté.
          </p>
          <div className="flex items-center gap-2 mt-4 text-sm text-[#FAFAF8]/60">
            <Clock className="h-4 w-4" />
            <span>
              Dernière actualisation : {lastRefresh.toLocaleTimeString('fr-FR')}
            </span>
          </div>
        </div>
        <BookOpen className="h-16 w-16 text-[#61AAF2] opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
      </div>
    </div>
  );
};
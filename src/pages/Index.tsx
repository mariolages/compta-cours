import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, Award } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light via-white to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Bannière principale */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Compta-Cours.fr
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              La plateforme dédiée au DCG et au BTS-CG
            </p>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-700">
            La plateforme de partage de ressources pour réussir vos examens en DCG et BTS-CG
          </p>

          {/* Boutons principaux */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Button 
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto text-lg py-6 px-8 bg-primary hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              S'inscrire
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              variant="secondary"
              className="w-full sm:w-auto text-lg py-6 px-8"
            >
              Se connecter
            </Button>
          </div>

          {/* Texte motivant */}
          <p className="text-gray-600 italic">
            Inscrivez-vous pour accéder à toutes les ressources DCG et BTS-CG
          </p>

          {/* Icônes illustratives */}
          <div className="flex justify-center gap-12 py-8">
            <BookOpen className="w-12 h-12 text-primary opacity-50" />
            <GraduationCap className="w-12 h-12 text-primary opacity-50" />
            <Award className="w-12 h-12 text-primary opacity-50" />
          </div>

          {/* Appel à l'action final */}
          <div className="pt-8">
            <Button 
              onClick={() => navigate("/register")}
              className="text-lg py-6 px-8 bg-primary hover:bg-primary-hover transition-all duration-300"
            >
              Rejoignez la plateforme dès maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
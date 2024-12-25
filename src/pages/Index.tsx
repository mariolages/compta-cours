import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-secondary">
      <div className="max-w-3xl w-full space-y-12 text-center animate-fade-in">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            DCGHub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Votre plateforme pour accéder, partager et organiser vos cours, exercices et corrections dans toutes les matières du DCG.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/login')}
            className="btn-primary text-lg px-8 py-3"
          >
            Se connecter
          </Button>
          <Button
            onClick={() => navigate('/register')}
            className="btn-secondary text-lg px-8 py-3"
          >
            S'inscrire
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {['Cours', 'Exercices', 'Corrections'].map((feature) => (
            <div key={feature} className="glass-card p-6 rounded-lg space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">{feature}</h3>
              <p className="text-gray-600">
                Accédez à une bibliothèque complète de ressources pour votre réussite au DCG.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
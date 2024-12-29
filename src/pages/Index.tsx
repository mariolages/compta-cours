import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            compta-cours.fr
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600">
            La plateforme de partage de ressources pour les étudiants en DCG
          </p>

          <div className="grid gap-4 md:grid-cols-2 max-w-lg mx-auto">
            <Button 
              onClick={() => navigate("/login")}
              className="text-lg py-6"
              variant="outline"
            >
              Se connecter
            </Button>
            <Button 
              onClick={() => navigate("/register")}
              className="text-lg py-6"
            >
              S'inscrire
            </Button>
          </div>

          <div className="mt-12">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-2xl font-semibold mb-4">DCG 1ère année</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-primary">UE1</h4>
                  <p className="text-gray-600">Fondamentaux du droit</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-primary">UE5</h4>
                  <p className="text-gray-600">Économie contemporaine</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-primary">UE9</h4>
                  <p className="text-gray-600">Comptabilité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
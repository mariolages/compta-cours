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

          <div className="mt-12 space-y-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">DCG 1ère année</h3>
                <p className="text-gray-600">UE1, UE5, UE9</p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">DCG 2ème année</h3>
                <p className="text-gray-600">UE2, UE4, UE6, UE10</p>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-2">DCG 3ème année</h3>
                <p className="text-gray-600">UE3, UE7, UE8, UE11, UE12, UE13</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
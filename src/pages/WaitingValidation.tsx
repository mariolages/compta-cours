import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function WaitingValidation() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkValidation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_validated')
        .eq('id', user.id)
        .single();

      if (profile?.is_validated) {
        navigate('/dashboard');
      }
    };

    checkValidation();

    // Vérifier périodiquement si l'utilisateur a été validé
    const interval = setInterval(checkValidation, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Compte en attente de validation</h1>
        <p className="text-gray-600">
          Votre compte est en attente de validation par un administrateur. 
          Vous recevrez un accès complet dès que votre compte sera validé.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
interface RegisterFormHeaderProps {
  error?: string;
}

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const RegisterFormHeader = ({ error }: RegisterFormHeaderProps) => {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-center">Créer un compte</h2>
        <p className="text-gray-500 text-center">Rejoignez la communauté DCGHub</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
};
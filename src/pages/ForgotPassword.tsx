import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message,
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-secondary">
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md animate-fade-in bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-center">Mot de passe oublié</h2>
          <p className="text-gray-500 text-center">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        {success && (
          <Alert className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || success}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || success}
        >
          {isLoading ? "Envoi..." : "Envoyer le lien"}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-primary hover:text-primary-hover text-sm">
            Retour à la connexion
          </a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
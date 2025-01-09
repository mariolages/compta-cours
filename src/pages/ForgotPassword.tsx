import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('Email not found')) {
          setError('Aucun compte n\'est associé à cet email');
        } else if (error.message.includes('rate limit')) {
          setError('Trop de tentatives. Veuillez réessayer plus tard');
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess(true);
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe. N'oubliez pas de vérifier vos spams.",
      });

      // Log password reset attempt
      await supabase
        .from('auth_logs')
        .insert([{ 
          email: email,
          event_type: 'password_reset_requested',
        }]);

    } catch (error: any) {
      setError('Une erreur est survenue lors de l\'envoi de l\'email');
      console.error('Password reset error:', error);
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

        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="animate-fade-in bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail (et vos spams).
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg transition-colors duration-300"
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
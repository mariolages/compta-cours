import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!/[0-9]/.test(password)) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation du mot de passe
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        if (updateError.message.includes('auth')) {
          setError('Le lien de réinitialisation a expiré. Veuillez recommencer le processus.');
          return;
        }
        throw updateError;
      }

      // Log successful password reset
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('auth_logs')
          .insert([{ 
            user_id: user.id,
            event_type: 'password_reset_success'
          }]);
      }

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès",
      });

      // Déconnexion pour forcer une nouvelle connexion avec le nouveau mot de passe
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('Une erreur est survenue lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-white to-secondary">
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md animate-fade-in bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-center">Réinitialiser le mot de passe</h2>
          <p className="text-gray-500 text-center">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre
            </p>
          </div>
          
          <Input
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg transition-colors duration-300"
          disabled={isLoading}
        >
          {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
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

export default ResetPassword;
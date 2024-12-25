import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError('');
    
    if (!email || !password) {
      setValidationError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Tentative de connexion avec:', email);
      
      // First, check if the user exists
      const { data: userExists, error: userCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', email)
        .maybeSingle();

      if (userCheckError) {
        console.error('Erreur lors de la vérification du compte:', userCheckError);
      }

      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (signInError) {
        console.error('Erreur de connexion détaillée:', signInError);
        
        if (signInError.message.includes('Invalid login credentials')) {
          setValidationError('Email ou mot de passe incorrect. Vérifiez vos identifiants et réessayez.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setValidationError('Veuillez confirmer votre email avant de vous connecter.');
        } else if (signInError.message.includes('Body is disturbed')) {
          setValidationError('Une erreur technique est survenue. La page va se recharger.');
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.location.reload();
        } else {
          setValidationError(`Erreur de connexion: ${signInError.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        console.error('Aucun utilisateur retourné après connexion');
        setValidationError('Erreur lors de la connexion');
        setIsLoading(false);
        return;
      }

      console.log('Vérification du profil pour:', data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_validated, is_admin')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Erreur lors de la vérification du profil:', profileError);
        setValidationError('Erreur lors de la vérification du compte');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!profile) {
        console.error('Aucun profil trouvé pour:', data.user.id);
        setValidationError('Compte non trouvé');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      if (!profile.is_validated && !profile.is_admin) {
        console.log('Compte non validé:', data.user.id);
        setValidationError('Votre compte est en attente de validation par un administrateur');
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      console.log('Connexion réussie pour:', data.user.id);
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur générale:', error);
      setValidationError('Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md animate-fade-in bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-center">Connexion à DCGHub</h2>
        <p className="text-gray-500 text-center">Accédez à vos ressources DCG</p>
      </div>
      
      {validationError && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationError}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full btn-primary"
        disabled={isLoading}
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>

      <div className="text-center space-y-2">
        <a href="/forgot-password" className="text-primary hover:text-primary-hover text-sm">
          Mot de passe oublié ?
        </a>
        <p className="text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-primary hover:text-primary-hover">
            S'inscrire
          </a>
        </p>
      </div>
    </form>
  );
};
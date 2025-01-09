import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AuthError, AuthApiError } from '@supabase/supabase-js';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<any>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes('Invalid login credentials')) {
            return 'Email ou mot de passe incorrect';
          }
          return error.message;
        case 422:
          return 'Format d\'email invalide';
        default:
          return error.message;
      }
    }
    return error.message;
  };

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
      // Clear any existing sessions first
      await supabase.auth.signOut();

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (signInError) {
        throw signInError;
      }

      const user = signInData?.user;
      if (!user) {
        throw new Error('Erreur lors de la connexion');
      }

      // Check if profile exists, if not create it
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            full_name: email.split('@')[0],
            is_admin: false,
            is_validated: false
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast({
            variant: "destructive",
            title: "Attention",
            description: "Votre profil n'a pas pu être créé. Certaines fonctionnalités pourraient être limitées.",
          });
        }
      }

      // Log successful login
      await supabase
        .from('auth_logs')
        .insert([{ 
          user_id: user.id,
          email: email,
          event_type: 'login_success'
        }]);

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setValidationError(getErrorMessage(error));
      
      // Log failed login attempt
      await supabase
        .from('auth_logs')
        .insert([{ 
          email: email,
          event_type: 'login_failed',
        }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
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
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded-lg transition-colors duration-300"
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
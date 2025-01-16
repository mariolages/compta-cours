import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<any>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if the user exists and get their UUID
      const { data: { user }, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (userError) {
        if (userError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect.');
        }
        throw userError;
      }

      if (user) {
        // Then check if the user is banned
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_banned')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile?.is_banned) {
          throw new Error('Votre compte a été banni. Contactez le support pour plus d\'informations.');
        }

        // If everything is good, proceed with login
        await onSubmit(email, password);

        // Log successful login
        await supabase.from('auth_logs').insert([
          {
            email,
            event_type: 'login_success',
            user_id: user.id
          }
        ]);

        // Refresh the session to ensure we have the latest token
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
      }

    } catch (error: any) {
      console.error('Login error:', error);

      // Log failed login attempt
      await supabase.from('auth_logs').insert([
        {
          email,
          event_type: 'login_failure'
        }
      ]);

      let errorMessage = "Une erreur est survenue lors de la connexion.";
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter.";
      } else if (error.message.includes('banni')) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous pour accéder à votre compte
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-sm text-right">
            <Link 
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link 
              to="/register"
              className="text-primary hover:underline"
            >
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
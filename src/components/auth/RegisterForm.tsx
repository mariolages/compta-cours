import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ADMIN_CODE = "DCG2024"; // Code secret pour devenir admin

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Inscription de l'utilisateur
      const { error: signUpError, data: { user } } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('Un compte existe déjà avec cet email. Veuillez vous connecter ou utiliser un autre email.');
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      if (user) {
        const isAdmin = adminCode === ADMIN_CODE;
        
        // Création du profil utilisateur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: name,
              is_admin: isAdmin,
            }
          ]);

        if (profileError) {
          setError('Erreur lors de la création du profil');
          console.error('Profile creation error:', profileError);
          return;
        }

        // Connexion automatique après l'inscription
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError('Erreur lors de la connexion automatique');
          console.error('Auto sign-in error:', signInError);
          return;
        }

        toast({
          title: "Inscription réussie",
          description: isAdmin 
            ? "Votre compte administrateur a été créé avec succès" 
            : "Votre compte a été créé avec succès",
        });
        
        // Redirection vers la page appropriée
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md animate-fade-in bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-xl">
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
      
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
            disabled={isLoading}
          />
        </div>
        
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

        <div>
          <Input
            type="password"
            placeholder="Code administrateur (optionnel)"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="input-field"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full btn-primary"
        disabled={isLoading}
      >
        {isLoading ? "Inscription..." : "S'inscrire"}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        Déjà inscrit ?{" "}
        <a href="/login" className="text-primary hover:text-primary-hover">
          Se connecter
        </a>
      </p>
    </form>
  );
};
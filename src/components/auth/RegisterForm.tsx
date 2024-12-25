import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement Supabase authentication
    toast({
      title: "Coming soon!",
      description: "Registration will be implemented with Supabase.",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-center">Créer un compte</h2>
        <p className="text-gray-500 text-center">Rejoignez la communauté DCGHub</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
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
          />
        </div>
        
        <div>
          <Input
            type="text"
            placeholder="Code administrateur (optionnel)"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <Button type="submit" className="w-full btn-primary">
        S'inscrire
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
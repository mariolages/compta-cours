import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RegisterFormHeader } from './RegisterFormHeader';
import { RegisterFormFields } from './RegisterFormFields';
import { RegisterFormFooter } from './RegisterFormFooter';

export const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const verifyAdminCode = async (code: string) => {
    if (!code) return { isAdmin: false };
    
    try {
      console.log('Vérification du code admin:', code);
      
      const { data, error } = await supabase
        .from('admin_codes')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la vérification du code admin:', error);
        return { isAdmin: false };
      }

      if (!data || data.is_used) {
        console.log('Code invalide ou déjà utilisé');
        return { isAdmin: false };
      }

      const { error: updateError } = await supabase
        .from('admin_codes')
        .update({ is_used: true })
        .eq('code', code);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du code:', updateError);
      }

      return { isAdmin: true };
    } catch (error) {
      console.error('Erreur dans verifyAdminCode:', error);
      return { isAdmin: false };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Erreur lors de la vérification des profils:', countError);
        setError('Erreur lors de la vérification du système');
        setIsLoading(false);
        return;
      }

      const isFirstUser = count === 0;
      const { isAdmin } = await verifyAdminCode(adminCode);

      const { error: signUpError, data: { user } } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: name.trim(),
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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: name.trim(),
              is_admin: isFirstUser || isAdmin,
              is_validated: isFirstUser || isAdmin,
            }
          ]);

        if (profileError) {
          setError('Erreur lors de la création du profil');
          console.error('Profile creation error:', profileError);
          return;
        }

        toast({
          title: "Inscription réussie",
          description: isFirstUser || isAdmin
            ? "Votre compte administrateur a été créé avec succès"
            : "Votre compte a été créé avec succès. Il doit être validé par un administrateur.",
        });

        if (isFirstUser || isAdmin) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
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
      <RegisterFormHeader error={error} />
      
      <RegisterFormFields
        name={name}
        email={email}
        password={password}
        adminCode={adminCode}
        isLoading={isLoading}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onAdminCodeChange={setAdminCode}
      />

      <RegisterFormFooter isLoading={isLoading} />
    </form>
  );
};
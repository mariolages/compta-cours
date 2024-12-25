import { LoginForm } from "@/components/auth/LoginForm";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const handleLogin = async (email: string, password: string) => {
    // Log the login attempt
    await supabase
      .from('auth_logs')
      .insert([
        { 
          email: email,
          event_type: 'login_attempt'
        }
      ]);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Check if user is banned
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', data.user.id)
      .single();

    if (profile?.is_banned) {
      throw new Error('Votre compte a été banni');
    }

    // Log successful login
    await supabase
      .from('auth_logs')
      .insert([
        { 
          user_id: data.user.id,
          email: email,
          event_type: 'login_success'
        }
      ]);

    return data;
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
          compta-cours.fr
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              La comptabilité n'a jamais été aussi simple à apprendre.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connexion
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez vos identifiants pour vous connecter
            </p>
          </div>
          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  );
}
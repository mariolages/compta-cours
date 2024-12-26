import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize session check
    const initSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (session) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      }
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
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
        console.error('Login error:', error);
        throw error;
      }

      // Check if user is banned
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_banned')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

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
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error.message || "Une erreur est survenue lors de la connexion",
      });
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with background and text */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 text-white p-12 flex-col justify-between relative">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-semibold">compta-cours.fr</span>
        </div>
        <h2 className="text-3xl font-light">
          La comptabilité n'a jamais été aussi simple à apprendre.
        </h2>
      </div>

      {/* Right side with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Entrez vos identifiants pour vous connecter
            </p>
          </div>

          <LoginForm onSubmit={handleLogin} />
        </div>
      </div>
    </div>
  );
}
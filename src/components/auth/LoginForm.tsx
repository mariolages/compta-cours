"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
});

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const { email, password } = values;
      console.log('Attempting login with:', email);

      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      if (signInError) {
        console.error('Login error details:', signInError);
        
        // Provide more specific error messages based on the error type
        if (signInError.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Email ou mot de passe incorrect. Si vous n'avez pas de compte, veuillez vous inscrire.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur de connexion",
            description: "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
          });
        }
        return;
      }

      if (signInData?.user) {
        console.log('Login successful for user:', signInData.user.id);
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-gray-500">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="exemple@email.com"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between items-center">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mot de passe oublié ?
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
          <div className="text-center text-sm text-gray-500 mt-4">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800">
              S'inscrire
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};
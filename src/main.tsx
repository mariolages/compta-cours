import { createRoot } from 'react-dom/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from "@/integrations/supabase/client"
import App from './App.tsx'
import './index.css'

// Initialize Supabase session
const initializeApp = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  createRoot(document.getElementById("root")!).render(
    <SessionContextProvider 
      supabaseClient={supabase}
      initialSession={session}
    >
      <App />
    </SessionContextProvider>
  );
};

initializeApp();
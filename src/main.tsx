import { createRoot } from 'react-dom/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from "@/integrations/supabase/client"
import App from './App.tsx'
import './index.css'

// Add a wrapper component to handle session state
const AppWrapper = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  );
};

createRoot(document.getElementById("root")!).render(<AppWrapper />);
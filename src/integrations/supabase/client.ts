// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sxpddyeasmcsnrbtvrgm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cGRkeWVhc21jc25yYnR2cmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNDE3MDQsImV4cCI6MjA1MDcxNzcwNH0.Cke7nDtIjXwugBUACPcCgmuiF_ALohF-VT59UfY7QQI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
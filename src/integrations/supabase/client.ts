import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = "https://sxpddyeasmcsnrbtvrgm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4cGRkeWVhc21jc25yYnR2cmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxNDE3MDQsImV4cCI6MjA1MDcxNzcwNH0.Cke7nDtIjXwugBUACPcCgmuiF_ALohF-VT59UfY7QQI"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
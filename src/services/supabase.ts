import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rztauxvmggsmvtjiljql.supabase.co/rest/v1/'; // ← votre URL Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ← votre clé anon

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkvwyrgvpliqnammfscr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrdnd5cmd2cGxpcW5hbW1mc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NzY1NjksImV4cCI6MjA2MTE1MjU2OX0._pbJKe5JLNZX9UY_KXpZSUT0bKb-2mJYBw5pIy865UQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
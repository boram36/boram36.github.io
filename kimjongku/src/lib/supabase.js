import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykuwblcwpmaclfnjxgyu.supabase.co"; // 여기에 정확히 복사
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrdXdibGN3cG1hY2xmbmp4Z3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjY0NTUsImV4cCI6MjA3OTY0MjQ1NX0.1Jt5JbxNvNnZtvd7aT9WqXPjZYsk9bCwzHP3TgQhZZA"; // Public anon key 전체 복사

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

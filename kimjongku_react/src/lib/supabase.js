import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lnfoyqgnldmeonuyezsh.supabase.co"; // 여기에 본인 프로젝트 URL 입력
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZm95cWdubGRtZW9udXllenNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTgzMTAsImV4cCI6MjA4MDEzNDMxMH0.FWLEvrQO6IDunRMLhiZrBNF1tMA6Bkt66ncWSqJrCFQ"; // 여기에 본인 anon key 입력

export const supabase = createClient(supabaseUrl, supabaseKey);

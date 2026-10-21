import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wwdkdaeeoyjwvaslcwgv.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3ZGtkYWVlb3lqd3Zhc2xjd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MDg2NjgsImV4cCI6MjEwNzk4NDY2OH0.ieEbpoe6_8qs5PEmcvPEwukxD43d7-idNCREhrgIFd4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


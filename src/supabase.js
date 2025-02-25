import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_APP_SUPABASE_URL,
  import.meta.env.VITE_APP_SUPABASE_KEY
);

export default supabase;

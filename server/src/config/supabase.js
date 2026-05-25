import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please set: SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
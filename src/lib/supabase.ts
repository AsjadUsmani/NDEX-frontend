import { createClient } from '@supabase/supabase-js'

/*
  SUPABASE SETUP (one-time, free):
  1. Go to supabase.com → New Project (free tier)
  2. Project Settings → API → copy:
     - Project URL → VITE_SUPABASE_URL
     - anon public key → VITE_SUPABASE_ANON_KEY
  3. Authentication → Providers → Enable GitHub:
     - Go to github.com/settings/developers → New OAuth App
     - Homepage URL: http://localhost:5173
     - Callback URL: https://YOUR_PROJECT.supabase.co/auth/v1/callback
     - Copy Client ID + Secret → paste in Supabase GitHub provider
  4. Authentication → Providers → Enable Google:
     - Go to console.cloud.google.com → APIs → Credentials
     - Create OAuth 2.0 Client ID (Web application)
     - Authorized redirect: https://YOUR_PROJECT.supabase.co/auth/v1/callback
     - Copy Client ID + Secret → paste in Supabase Google provider
  5. Authentication → URL Configuration:
     - Site URL: http://localhost:5173
     - Redirect URLs: http://localhost:5173/dashboard
*/

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env
const supabaseUrl  = env.VITE_SUPABASE_URL
const supabaseKey  = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase env vars missing — auth disabled')
}

export const supabase = createClient(
  supabaseUrl  || '',
  supabaseKey  || ''
)

// Auth helpers
export const signInWithGitHub = () =>
  supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'read:user repo',   // repo scope = read GitHub repos
    },
  })

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

export const getSession = () => supabase.auth.getSession()

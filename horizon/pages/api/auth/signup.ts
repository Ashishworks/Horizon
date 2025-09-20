import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase'; 

type Data = {
  message?: string;
  error?: string;
  user?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return res.status(400).json({ error: authError.message });

  // Insert additional user info into 'users' table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([{ id: authData.user?.id, name, email: authData.user?.email  }]);

  if (userError) return res.status(400).json({ error: userError.message });

  res.status(200).json({ message: 'User created successfully', user: authData.user });
}

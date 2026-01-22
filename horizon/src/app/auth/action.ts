"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();


  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();


  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { ok: false, message: error.message };
  }

  // If you're NOT using email confirmation => data.user exists immediately
  if (data.user) {
    redirect(`/onboarding?user_id=${data.user.id}`);
  }

  // If email confirmation is ON
  return {
    ok: true,
    message: "Check your email to confirm signup.",
  };
}

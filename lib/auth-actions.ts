"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured) {
    // Mode démo : pas de vraie auth, on renvoie vers l'espace compte
    redirect("/compte");
  }

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const next = String(formData.get("next") || "/compte");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/connexion?error=${encodeURIComponent("Identifiants incorrects")}`);
  }
  redirect(next);
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/compte");
  }

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name") || "");
  const [first_name, ...rest] = fullName.trim().split(" ");
  const last_name = rest.join(" ");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { first_name, last_name, role: "client" } },
  });

  if (error) {
    redirect(`/inscription?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/compte");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

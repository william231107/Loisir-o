"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createActivity(formData: FormData) {
  if (!isSupabaseConfigured) {
    // Mode démo : on ne persiste pas, on renvoie vers la liste
    redirect("/pro/activites");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/pro/activites/nouvelle");

  const { data: pro } = await supabase
    .from("professionals")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!pro) redirect("/pro/inscription");

  const title = String(formData.get("title"));
  const category = String(formData.get("category"));
  const description = String(formData.get("description") || "");
  const priceEuros = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 60);
  const maxP = Number(formData.get("max_participants") || 1);

  const { error } = await supabase.from("activities").insert({
    professional_id: pro.id,
    slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    category,
    description,
    price_cents: Math.round(priceEuros * 100),
    duration_minutes: duration,
    min_participants: 1,
    max_participants: maxP,
    is_published: true,
  });

  if (error) {
    redirect(`/pro/activites/nouvelle?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/pro/activites");
  redirect("/pro/activites");
}

export async function updateProfessional(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/pro/parametres?saved=1");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/pro/parametres");

  const { error } = await supabase
    .from("professionals")
    .update({
      company_name: String(formData.get("company_name")),
      description: String(formData.get("description") || ""),
      phone: String(formData.get("phone") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      postal_code: String(formData.get("postal_code") || ""),
    })
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/pro/parametres?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/pro/parametres");
  redirect("/pro/parametres?saved=1");
}

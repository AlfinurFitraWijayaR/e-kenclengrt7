"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user role for redirect
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const userRole = profile?.role || "officer";

  // Redirect based on role
  redirect(userRole === "admin" ? "/admin" : "/");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "officer", // Default role is officer
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?message=Periksa email Anda untuk verifikasi");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function isAdmin() {
  const profile = await getUserProfile();
  return profile?.role === "admin";
}

export async function isOfficer() {
  const profile = await getUserProfile();
  return profile?.role === "officer";
}

export async function requireAuth() {
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("Unauthorized: Not logged in");
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await getUserProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return profile;
}

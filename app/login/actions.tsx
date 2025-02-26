"use server";
import { supabase } from "@/lib/supabase";
import { IUser } from "@/supabase/typings";

export type LoginFormData = { username: string; password: string };

export async function login(_: unknown, formData: FormData): Promise<IUser> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, role, password")
      .eq("username", username)
      .single();

    if (error || (user && user.password !== password)) {
      return {} as IUser;
    }
    return user as IUser;
  } catch (e) {
    console.error(e);
  }
  return {} as IUser;
}

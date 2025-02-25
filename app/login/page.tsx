"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IUser } from "@/supabase/typings";

interface UserResponse extends Omit<IUser, "role"> {
  role: "user" | "admin";
  error: string;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.target as HTMLFormElement);
    const form = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: UserResponse = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error || "Invalid login credentials");
        return;
      }

      setUser({ id: data.id, username: data.username, role: data.role });
      router.push(data.role === "admin" ? "/admin" : "/questionnaires");
    } catch (e: unknown) {
      console.log(e);
      setError((e as Error).message || "An error occurred");
    }
  };

  return (
    <form className="flex flex-col items-center mt-20" onSubmit={handleLogin}>
      <input
        className="border p-2 mb-2"
        name="username"
        placeholder="Username"
      />
      <input
        className="border p-2 mb-2"
        type="password"
        name="password"
        placeholder="Password"
      />
      {error && <p className="text-red-800">{error}</p>}
      <button
        className="bg-blue-500 text-white px-4 py-2"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

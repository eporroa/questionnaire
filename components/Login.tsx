"use client";
import { type FC, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { login } from "@/app/login/actions";

const Login: FC = () => {
  const [data, formAction, isPending] = useActionState(login, null);
  const [error, setError] = useState<string>();

  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    if (data && data.id) {
      setUser({
        id: data.id,
        username: data.username,
        role: data.role as "user" | "admin",
      });
      router.push(data.role === "admin" ? "/admin" : "/questionnaires");
    }
    if (data !== null && data?.id === undefined) {
      setError("Invalid login credentials");
    }
  }, [router, data, setUser]);

  return (
    <form className="flex flex-col items-center mt-20" action={formAction}>
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
        disabled={isPending}
      >
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;

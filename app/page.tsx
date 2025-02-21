"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user.value) {
      router.replace("/login");
    } else {
      router.replace(
        user.value.role === "admin" ? "/admin" : "/questionnaires"
      );
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-screen text-xl">
      Redirecting...
    </div>
  );
}

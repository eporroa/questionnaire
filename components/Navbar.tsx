"use client";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <h1>Questionnaire App</h1>
      <div>
        {user.value ? (
          <>
            <span className="mr-4">
              Welcome, {user.value.username} ({user.value.role})
            </span>
            <button className="bg-red-500 px-4 py-2" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <span>Not logged in</span>
        )}
      </div>
    </nav>
  );
}

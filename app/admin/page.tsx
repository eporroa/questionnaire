"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface UserData {
  username: string;
  completed_questionnaires: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.value || user.value.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [user, router]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("user_answers")
      .select(
        "user_id, COUNT(DISTINCT questionnaire_id) as completed_questionnaires"
      )
      .groupBy("user_id");

    if (error) {
      console.error("Error fetching users:", error.message);
      return;
    }

    // Fetch usernames
    const userIds = data.map((u) => u.user_id);
    const { data: userData } = await supabase
      .from("users")
      .select("id, username")
      .in("id", userIds);

    if (!userData) return;

    const formattedUsers = data.map((u) => ({
      username:
        userData.find((usr) => usr.id === u.user_id)?.username || "Unknown",
      completed_questionnaires: u.completed_questionnaires,
    }));

    setUsers(formattedUsers);
  }

  async function fetchUserResponses(username: string) {
    setLoading(true);
    setSelectedUser(username);

    const { data, error } = await supabase
      .from("user_answers")
      .select(
        "questionnaire_id, question_id, answer, questionnaire_questionnaires(name), questionnaire_questions(question)"
      )
      .eq("user_id", users.find((u) => u.username === username)?.username); // Replace with user ID mapping

    if (error) {
      console.error("Error fetching user responses:", error.message);
      setLoading(false);
      return;
    }

    setUserResponses(data || []);
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-4">View users and their completed questionnaires</p>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Username</th>
            <th className="border p-2">Completed Questionnaires</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.username} className="border">
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.completed_questionnaires}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-4 py-1"
                  onClick={() => fetchUserResponses(user.username)}
                >
                  View Responses
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div className="mt-6 p-4 border rounded-lg shadow-lg bg-white">
          <h2 className="text-xl font-semibold">
            Responses for {selectedUser}
          </h2>
          {loading ? (
            <p>Loading responses...</p>
          ) : userResponses.length > 0 ? (
            userResponses.map((response, index) => (
              <div key={index} className="border p-2 my-2">
                <p>
                  <strong>Questionnaire:</strong>{" "}
                  {response.questionnaire_questionnaires.name}
                </p>
                <p>
                  <strong>Q:</strong> {JSON.parse(response.question).question}
                </p>
                <p>
                  <strong>A:</strong>{" "}
                  {Array.isArray(response.answer)
                    ? response.answer.join(", ")
                    : response.answer}
                </p>
              </div>
            ))
          ) : (
            <p>No responses found.</p>
          )}
        </div>
      )}
    </div>
  );
}

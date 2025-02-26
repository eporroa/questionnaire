"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Question } from "../(user)/questionnaire/[id]/page";

interface UserParsedAnswers {
  questionnaire_id: string;
  question_id: string;
  answer: Record<string | number, string | string[]>;
  questionnaire_questionnaires: {
    name: string;
  };
  questionnaire_questions: {
    question: string;
  };
}
interface UserData {
  id: string;
  username: string;
  completed_questionnaires: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserParsedAnswers[]>([]);
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
      .select("user_id, completed_questionnaires:questionnaire_id.count()");

    if (error) {
      console.error("Error fetching users:", error.message);
      return;
    }

    // Fetch usernames
    const userIds = data.map((u) => u.user_id);
    const { data: userData } = await supabase
      .from("users")
      .select("id, username")
      .in("id", userIds as string[]);

    if (!userData) return;

    const formattedUsers = data.map((u) => ({
      id: u.user_id as string,
      username:
        userData.find((usr) => usr.id === u.user_id)?.username || "Unknown",
      completed_questionnaires: u.completed_questionnaires,
    }));

    setUsers(formattedUsers);
  }

  async function fetchUserResponses(id: string) {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_answers")
        .select(
          "questionnaire_id, question_id, answer, questionnaire_questionnaires(name), questionnaire_questions(question)"
        )
        .eq("user_id", users.find((u) => u.id === id)?.id as string);

      if (error) {
        console.error("Error fetching user responses:", error.message);
        return;
      }
      setSelectedUser(users.find((u) => u.id === id)?.username ?? null);
      setUserAnswers(data as unknown as UserParsedAnswers[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
                  onClick={() => fetchUserResponses(user.id)}
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
          ) : userAnswers.length > 0 ? (
            (() => {
              // Group answers by questionnaire
              const groupedAnswers = userAnswers.reduce((acc, response) => {
                const questionnaireName =
                  response.questionnaire_questionnaires?.name ||
                  "Ungrouped Questions";

                if (!acc[questionnaireName]) {
                  acc[questionnaireName] = [];
                }

                acc[questionnaireName].push(response);
                return acc;
              }, {} as Record<string, typeof userAnswers>);

              return Object.entries(groupedAnswers).map(
                ([questionnaireName, responses]) => (
                  <div key={questionnaireName} className="mb-6">
                    <h3 className="text-lg font-medium border-b-2 border-gray-200 pb-2 mb-3">
                      {questionnaireName}
                    </h3>
                    <div className="pl-4">
                      {responses.map((response, index) => (
                        <div
                          key={index}
                          className="border rounded p-3 my-2 bg-gray-50"
                        >
                          <p className="font-medium">
                            {
                              (
                                response.questionnaire_questions
                                  .question as unknown as Question
                              ).question
                            }
                          </p>
                          <p className="mt-1 text-gray-700">
                            <span className="font-medium">Answer: </span>
                            {Array.isArray(response.answer)
                              ? response.answer.join(", ")
                              : (response.answer as unknown as string) ||
                                "No answer provided."}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Question ID: {response.question_id}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              );
            })()
          ) : (
            <p>No responses found.</p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { IUserAnswers } from "@/supabase/typings";

type QuestionType = {
  type: "mcq" | "input";
  options?: string[];
  question: string;
};

interface UserResponse extends Omit<IUserAnswers, "answer"> {
  answer: string | string[];
  questionnaire_questionnaires: {
    name: string;
  } | null;
  questionnaire_questions: {
    question: QuestionType;
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
  const [userAnswers, setUserAnswers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.value || user.value.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [user, router]);

  async function fetchUsers() {
    try {
      const { data: answerData, error: answerError } = await supabase
        .from("user_answers")
        .select("user_id, questionnaire_id");

      if (answerError) {
        console.error("Error fetching user answers:", answerError.message);
        return;
      }

      const userQuestionnaireCounts = answerData.reduce((acc, item) => {
        if (!item.user_id) return acc;

        if (!acc[item.user_id]) {
          acc[item.user_id] = new Set();
        }

        if (item.questionnaire_id) {
          acc[item.user_id].add(item.questionnaire_id);
        }

        return acc;
      }, {} as Record<string, Set<number>>);

      const userIds = Object.keys(userQuestionnaireCounts);
      if (userIds.length === 0) {
        setUsers([]);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, username")
        .in("id", userIds);

      if (userError) {
        console.error("Error fetching users:", userError.message);
        return;
      }

      const formattedUsers = userData.map((u) => ({
        id: u.id,
        username: u.username,
        completed_questionnaires: userQuestionnaireCounts[u.id]?.size || 0,
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  }

  async function fetchUserResponses(id: string) {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_answers")
        .select(
          "questionnaire_id, question_id, answer, questionnaire_questionnaires(name), questionnaire_questions(question)"
        )
        .eq("user_id", id);

      if (error) {
        console.error("Error fetching user responses:", error.message);
        return;
      }

      const username = users.find((u) => u.id === id)?.username || "";
      setSelectedUser(username);
      setUserAnswers(data as UserResponse[]);
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
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="border hover:bg-gray-50">
                <td className="border p-2">{user.username}</td>
                <td className="border p-2 text-center">
                  {user.completed_questionnaires}
                </td>
                <td className="border p-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                    onClick={() => fetchUserResponses(user.id)}
                  >
                    View Responses
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="border p-4 text-center text-gray-500">
                No users found with completed questionnaires
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedUser && (
        <div className="mt-6 p-4 border rounded-lg shadow-lg bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Responses for {selectedUser}
            </h2>
            <button
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p>Loading responses...</p>
            </div>
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
              }, {} as Record<string, UserResponse[]>);

              return Object.entries(groupedAnswers).map(
                ([questionnaireName, responses]) => (
                  <div key={questionnaireName} className="mb-6">
                    <h3 className="text-lg font-medium border-b-2 border-gray-200 pb-2 mb-3">
                      {questionnaireName}
                    </h3>
                    <div className="pl-4">
                      {responses.map((response, index) => {
                        const question =
                          response.questionnaire_questions.question;
                        return (
                          <div
                            key={index}
                            className="border rounded p-3 my-2 bg-gray-50"
                          >
                            <p className="font-medium">{question.question}</p>
                            <p className="mt-1 text-gray-700">
                              <span className="font-medium">Answer: </span>
                              {Array.isArray(response.answer)
                                ? response.answer.join(", ")
                                : response.answer || "No answer provided."}
                            </p>
                            <div className="flex gap-4 text-xs text-gray-500 mt-2">
                              <p>Question ID: {response.question_id}</p>
                              <p>Question Type: {question.type}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              );
            })()
          ) : (
            <p className="text-center p-4 text-gray-500">
              No responses found for this user.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

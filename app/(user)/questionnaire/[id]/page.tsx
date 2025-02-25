"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Question = {
  id: number;
  question: string;
  type: "mcq" | "input";
  options?: string[];
};

type Answer = {
  [key: number]: string | string[];
};

type Params = {
  id: string;
};

interface QuestionnairePageProps {
  params: Promise<Params>;
}

export default function QuestionnairePage({ params }: QuestionnairePageProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState({});

  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    async function fetchQuestions() {
      const { data } = await supabase
        .from("questionnaire_junction")
        .select("question_id, priority, questionnaire_questions(id, question)")
        .eq("questionnaire_id", Number(id))
        .order("priority", { ascending: true });

      setQuestions(
        data
          ? data.map((q) => {
            const question = {...(q.questionnaire_questions?.question ?? {})};
            return ({
              id: q.question_id,
              ...question
            })})
          : []
      );
    }
    fetchQuestions();
  }, [id]);

  const handleSubmit = async () => {
    for (const [id, answer] of Object.entries(answers)) {
      await supabase.from("user_answers").upsert({
        user_id: user.value?.id,
        question_id: id,
        answer,
      }: IUserAnswers);
    }
    router.push("/questionnaires");
  };

  return (
    <div className="p-5">
      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="font-semibold">{q.question}</p>
          {q.type === "mcq" ? (
            (q.options ?? []).map((opt) => (
              <label key={opt} className="block">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: e.target.checked
                        ? [...(prev[q.id] || []), opt]
                        : (prev[q.id] || []).filter((item) => item !== opt),
                    }));
                  }}
                />
                {opt}
              </label>
            ))
          ) : (
            <input
              className="border p-2 w-full"
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
            />
          )}
        </div>
      ))}
      <button
        className="bg-green-500 text-white px-4 py-2"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}

"use client";

import { type Question } from "@/app/(user)/questionnaire/[id]/page";
import { useState, type FC } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { IUserAnswers } from "@/supabase/typings";
import { Json } from "@/supabase/supabase";

type Answers = {
  [key: number]: string | string[];
};

interface QuestionnaireProps {
  id: number;
  questions: Question[];
}

const Questionnaire: FC<QuestionnaireProps> = ({ questions }) => {
  const [answers, setAnswers] = useState<Answers>({});

  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    const userAnswers = [];
    for (const [id, answer] of Object.entries(answers)) {
      const newItem = {
        user_id: user.value?.id,
        question_id: id,
        questionnaire_id: 1,
        answer: answer as Json,
      } as unknown as IUserAnswers;
      userAnswers.push(newItem);
    }

    try {
      await supabase.from("user_answers").upsert(userAnswers);
      router.push("/questionnaires");
    } catch (error) {
      console.error("Error inserting user answers", error);
      alert("Error inserting user answers");
    }
  };

  return (
    <div className="p-5">
      {questions.map((question) => (
        <div key={question.id} className="mb-4">
          <p className="font-semibold">{question.question}</p>
          {question.type === "mcq" ? (
            question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  className="mr-2"
                  onChange={(e) => {
                    setAnswers((prev) => {
                      const currentAnswers = Array.isArray(prev[question.id])
                        ? prev[question.id]
                        : [];
                      return {
                        ...prev,
                        [question.id]: e.target.checked
                          ? [...currentAnswers, option]
                          : (currentAnswers as []).filter(
                              (item: string) => item !== option
                            ),
                      };
                    });
                  }}
                />
                {option}
              </label>
            ))
          ) : (
            <input
              className="border p-2 w-full"
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: e.target.value,
                }))
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
};

export default Questionnaire;

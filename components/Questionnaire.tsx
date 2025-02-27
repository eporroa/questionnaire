"use client";

import { type Question } from "@/app/(user)/questionnaire/[id]/page";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FC } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { Json } from "@/supabase/supabase";
import { IUserAnswers } from "@/supabase/typings";

type Answers = {
  [key: number]: string | string[];
};

interface QuestionnaireProps {
  id: number;
  questions: Question[];
}

const Questionnaire: FC<QuestionnaireProps> = ({
  id: questionnarieId,
  questions,
}) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchPreviousAnswers = async () => {
      if (!user.value?.id) return;

      setLoading(true);
      try {
        const questionIds = questions.map((q) => q.id);
        const { data, error } = await supabase
          .from("user_answers")
          .select("question_id, answer")
          .eq("user_id", user.value.id)
          .in("question_id", questionIds);

        if (error) throw error;

        if (data && data.length > 0) {
          const previousAnswers: Answers = {};
          data.forEach((item) => {
            previousAnswers[item.question_id as number] = item.answer as
              | string
              | string[];
          });
          setAnswers(previousAnswers);
        }
      } catch (error) {
        console.error("Error fetching previous answers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousAnswers();
  }, [user.value?.id, questions]);

  const validateAnswers = (): boolean => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    questions.forEach((question) => {
      if (question.type === "input") {
        const answer = answers[question.id] as string;
        if (!answer || answer.trim() === "") {
          newErrors[question.id] = "This field cannot be empty";
          isValid = false;
        }
      } else if (question.type === "mcq") {
        const answer = answers[question.id] as string[];
        if (!answer || answer.length === 0) {
          newErrors[question.id] = "Please select at least one option";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) return;

    const userAnswers = [];
    for (const [id, answer] of Object.entries(answers)) {
      const newItem = {
        user_id: user.value?.id,
        question_id: parseInt(id),
        questionnaire_id: questionnarieId,
        answer: answer as Json,
      } as unknown as IUserAnswers;
      userAnswers.push(newItem);
    }

    try {
      await supabase.from("user_answers").upsert(userAnswers);
      addToast("Answers submitted successfully");
      router.push("/questionnaires");
    } catch (error) {
      console.error("Error inserting user answers", error);
      alert("Error inserting user answers");
    }
  };

  if (loading) {
    return <div className="p-5">Loading questionnaire...</div>;
  }

  return (
    <div className="flex flex-col gap-2 p-5">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {questions.map((question) => (
        <div key={question.id} className="mb-2">
          <p className="font-semibold mb-2">{question.question}</p>

          {question.type === "mcq" ? (
            <div className="pl-3">
              {question.options?.map((option) => (
                <label key={option} className="mb-1 flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-5 w-5"
                    checked={
                      Array.isArray(answers[question.id]) &&
                      (answers[question.id] as string[])?.includes(option)
                    }
                    onChange={(e) => {
                      setAnswers((prev) => {
                        const currentAnswers = Array.isArray(prev[question.id])
                          ? (prev[question.id] as string[])
                          : [];

                        if (errors[question.id]) {
                          setErrors((prevErrors) => ({
                            ...prevErrors,
                            [question.id]: "",
                          }));
                        }

                        return {
                          ...prev,
                          [question.id]: e.target.checked
                            ? [...currentAnswers, option]
                            : currentAnswers.filter((item) => item !== option),
                        };
                      });
                    }}
                  />
                  {option}
                </label>
              ))}
              {errors[question.id] && (
                <p className="text-red-900 text-sm mt-1">
                  {errors[question.id]}
                </p>
              )}
            </div>
          ) : (
            <div>
              <input
                className={`border p-2 w-full rounded ${
                  errors[question.id] ? "border-red-900" : ""
                }`}
                value={(answers[question.id] as string) || ""}
                onChange={(e) => {
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: e.target.value,
                  }));
                  if (errors[question.id]) {
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      [question.id]: "",
                    }));
                  }
                }}
              />
              {errors[question.id] && (
                <p className="text-red-900 text-sm mt-1">
                  {errors[question.id]}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-row gap-3">
        <Link
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
          href="/questionnaires"
        >
          Cancel
        </Link>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
          onClick={handleSubmit}
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("questionnaire_questionnaires")
        .select("*");
      setQuestionnaires(data ?? []);
    }
    fetchData();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Select a Questionnaire</h1>
      {questionnaires.map((q) => (
        <button
          key={q.id}
          className="block p-3 mb-2 border"
          onClick={() => router.push(`/questionnaire/${q.id}`)}
        >
          {q.name}
        </button>
      ))}
    </div>
  );
}

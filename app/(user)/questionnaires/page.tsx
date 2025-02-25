// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { IQuestionnaires } from "@/supabase/typings";
import Link from "next/link";

export default async function QuestionnairesPage() {
  // const [questionnaires, setQuestionnaires] = useState<IQuestionnaires[]>([]);
  const { data = [] } = await supabase
    .from("questionnaire_questionnaires")
    .select("*");
  const questionnaires = data as IQuestionnaires[];

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Select a Questionnaire</h1>
      {questionnaires.map((q) => (
        <Link
          key={q.id}
          className="block p-3 mb-2 border cursor-pointer"
          href={`/questionnaire/${q.id}`}
        >
          {q.name}
        </Link>
      ))}
    </div>
  );
}

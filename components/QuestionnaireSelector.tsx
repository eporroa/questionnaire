import Link from "next/link";
import { FC } from "react";

import { IQuestionnaires } from "@/supabase/typings";

type QuestionnaireSelectorProps = {
  questionnaires: IQuestionnaires[];
};

const QuestionnaireSelector: FC<QuestionnaireSelectorProps> = ({
  questionnaires,
}) => {
  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Select a Questionnaire</h1>
      {questionnaires.map((q) => (
        <Link
          key={q.id}
          className="block p-3 mb-2 border hover:bg-gray-100"
          href={`/questionnaire/${q.id}`}
        >
          {q.name}
        </Link>
      ))}
    </div>
  );
};

export default QuestionnaireSelector;

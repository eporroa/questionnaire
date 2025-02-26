import Questionnaire from "@/components/Questionnaire";
import { supabase } from "@/lib/supabase";

export type Question = {
  id: number;
  question: string;
  type: "mcq" | "input";
  options?: string[];
};

type Params = {
  id: string;
};
interface QuestionnairePageProps {
  params: Promise<Params>;
}

export default async function QuestionnairePage({
  params,
}: QuestionnairePageProps) {
  const { id } = await params;
  const { data } = await supabase
    .from("questionnaire_junction")
    .select("question_id, priority, questionnaire_questions(id, question)")
    .eq("questionnaire_id", Number(id))
    .order("priority", { ascending: true });

  const questions = data?.map((q) => ({
    ...(q.questionnaire_questions?.question as Question),
    id: q.question_id,
  })) as Question[];

  return <Questionnaire questions={questions} />;
}

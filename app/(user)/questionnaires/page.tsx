import QuestionnaireSelector from "@/components/QuestionnaireSelector";
import { supabase } from "@/lib/supabase";
import { IQuestionnaires } from "@/supabase/typings";

export default async function QuestionnairesPage() {
  const { data } = await supabase
    .from("questionnaire_questionnaires")
    .select("*");

  return <QuestionnaireSelector questionnaires={data as IQuestionnaires[]} />;
}

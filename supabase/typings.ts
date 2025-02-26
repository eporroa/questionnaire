import { Database } from "./supabase";

export type IQuestionnaireJunction =
  Database["public"]["Tables"]["questionnaire_junction"]["Row"];
export type IQuestionnaires =
  Database["public"]["Tables"]["questionnaire_questionnaires"]["Row"];
export type IUserAnswers = Database["public"]["Tables"]["user_answers"]["Row"];
export type IUser = Database["public"]["Tables"]["users"]["Row"];

export interface IQuestions
  extends Omit<
    Database["public"]["Tables"]["questionnaire_questions"]["Row"],
    "questionnaire"
  > {
  questionnaire: IQuestionnaires;
}

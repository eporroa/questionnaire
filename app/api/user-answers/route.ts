import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_answers")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const { userId, questionnaireId, answers } = await req.json();

  if (!userId || !questionnaireId || !answers) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const entries = Object.entries(answers).map(([questionId, answer]) => ({
    user_id: userId,
    questionnaire_id: questionnaireId,
    question_id: parseInt(questionId),
    answer: JSON.stringify(answer),
  }));

  const { error } = await supabase.from("user_answers").upsert(entries);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Answers saved" }, { status: 201 });
}

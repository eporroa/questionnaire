-- users table (stores user details)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- (hardcoded in frontend for simplicity)
  role TEXT CHECK (role IN ('user', 'admin')) NOT NULL
);

-- questionnaire_questionnaires table (stores different questionnaires)
CREATE TABLE questionnaire_questionnaires (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- questionnaire_questions table (stores questions)
CREATE TABLE questionnaire_questions (
    id SERIAL PRIMARY KEY,
    question JSONB NOT NULL
);

-- questionnaire_junction table (maps questions to questionnaires)
CREATE TABLE questionnaire_junction (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
    questionnaire_id INT REFERENCES questionnaire_questionnaires(id) ON DELETE CASCADE,
    priority INT NOT NULL,
    UNIQUE(question_id, questionnaire_id)
);

-- user_answers table (stores user responses to questions)
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  questionnaire_id INT REFERENCES questionnaire_questionnaires(id) ON DELETE CASCADE,
  question_id INT REFERENCES questionnaire_questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL, 
  UNIQUE(user_id, questionnaire_id, question_id)
);

import { db } from "@/firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import React from "react";
interface Answer {
  answer: string;
  [key: string]: any;
}

interface Question {
  questionTitle: string;
  questionTime: number;
  questionPoints: number;
  answers: Answer[];
  correctAnswer: number;
  [key: string]: any;
}

interface Quiz {
  quizName: string;
  questionIntermission: number;
  quizCode: number;
  hasBonusPoints: boolean;
  maxBonusPoints: number;
  questions: Question[];
  [key: string]: any;
}

const DynamicForm: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = React.useState<Quiz>({
    quizName: "",
    questionIntermission: 0,
    quizCode: 0,
    hasBonusPoints: false,
    maxBonusPoints: 0,
    questions: [
      {
        questionTitle: "",
        questionTime: 0,
        questionPoints: 0,
        answers: [{ answer: "" }],
        correctAnswer: 0,
      },
    ],
  });

  const addQuestionRow = () => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions.push({
      questionTitle: "",
      questionTime: 0,
      questionPoints: 0,
      answers: [{ answer: "" }],
      correctAnswer: 0,
    });
    setCurrentQuiz(updatedQuiz);
  };

  const removeQuestionRow = (questionIndex: number) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions.splice(questionIndex, 1);
    setCurrentQuiz(updatedQuiz);
  };

  const addAnswerRow = (questionIndex: number) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].answers.push({
      answer: "",
    });
    setCurrentQuiz(updatedQuiz);
  };

  const handleBonusPointsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentQuiz({
      ...currentQuiz,
      hasBonusPoints: event.target.checked,
      maxBonusPoints: event.target.checked ? currentQuiz.maxBonusPoints : 0,
    });
  };

  const handleMaxBonusPointsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentQuiz({
      ...currentQuiz,
      maxBonusPoints: +event.target.value,
    });
  };

  const removeAnswerRow = (questionIndex: number, answerIndex: number) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].answers.splice(answerIndex, 1);
    setCurrentQuiz(updatedQuiz);
  };

  const handleQuizChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentQuiz({
      ...currentQuiz,
      [event.target.name]:
        event.target.type === "number"
          ? +event.target.value
          : event.target.value,
    });
  };

  const handleQuestionChange = (
    questionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex][event.target.name] =
      event.target.type === "number" ? +event.target.value : event.target.value;
    setCurrentQuiz(updatedQuiz);
  };

  const handleAnswerChange = (
    questionIndex: number,
    answerIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].answers[answerIndex][
      event.target.name
    ] = event.target.value;
    setCurrentQuiz(updatedQuiz);
  };

  const handleCorrectAnswerChange = (
    questionIndex: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].correctAnswer = parseInt(
      event.target.value,
      10
    );
    setCurrentQuiz(updatedQuiz);
  };

  const saveQuizData = async () => {
    if (isValidForm()) {
      try {
        const quizRef = await addDoc(collection(db, "quizzes"), {
          quizName: currentQuiz.quizName,
          quizCode: currentQuiz.quizCode,
          hasBonusPoints: currentQuiz.hasBonusPoints,
          maxBonusPoints: currentQuiz.maxBonusPoints,
          questionIntermission: currentQuiz.questionIntermission,
          quizStarted: false,
        });

        const quizId = quizRef.id;

        for (const question of currentQuiz.questions) {
          await addDoc(collection(db, `quizzes/${quizId}/questions`), {
            questionTitle: question.questionTitle,
            questionTime: question.questionTime,
            possibleAnswers: question.answers.length,
            answers: question.answers.map((answer) => answer.answer),
            correctAnswer: question.correctAnswer,
            questionPoints: question.questionPoints,
          });
        }

        alert("Quiz data saved successfully");
        resetForm();
      } catch (error) {
        console.error("Error saving quiz data: ", error);
        alert("Error saving quiz data. Please try again.");
      }
    } else {
      alert("Form Invalid");
    }
  };

  const isValidForm = () => {
    // Check for blank fields in quiz details
    const quizDetailsFields = ["quizName", "questionIntermission", "quizCode"];
    const hasBlankQuizDetails = quizDetailsFields.some(
      (field) => !currentQuiz[field]
    );

    if (hasBlankQuizDetails) {
      return false;
    }

    // Check for blank fields in each question
    const hasBlankQuestion = currentQuiz.questions.some((question) => {
      const questionFields = [
        "questionTitle",
        "questionTime",
        "questionPoints",
      ];
      const hasBlankQuestionField = questionFields.some(
        (field) => !question[field]
      );

      const hasBlankAnswer = question.answers.some((answer) => !answer.answer);

      return hasBlankQuestionField || hasBlankAnswer;
    });

    return !hasBlankQuestion;
  };

  const resetForm = () => {
    setCurrentQuiz({
      quizName: "",
      questionIntermission: 0,
      quizCode: 0,
      hasBonusPoints: false,
      maxBonusPoints: 0,
      questions: [
        {
          questionTitle: "",
          questionTime: 0,
          questionPoints: 0,
          answers: [{ answer: "" }],
          correctAnswer: 0,
        },
      ],
    });
  };

  return (
    <div className="container mx-auto my-10 p-6 bg-gray-100 shadow-md">
      <div className="mb-8 p-4 border rounded">
        <div className="mb-4">
          <label htmlFor="quizName" className="block font-bold mb-2">
            Quiz Name
          </label>
          <input
            name="quizName"
            value={currentQuiz.quizName}
            type="text"
            onChange={handleQuizChange}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="questionIntermission"
            className="block font-bold mb-2"
          >
            Question Intermission
          </label>
          <input
            name="questionIntermission"
            inputMode="numeric"
            value={currentQuiz.questionIntermission}
            type="number"
            onChange={handleQuizChange}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quizCode" className="block font-bold mb-2">
            Quiz Code
          </label>
          <input
            name="quizCode"
            value={currentQuiz.quizCode}
            inputMode="numeric"
            type="number"
            onChange={handleQuizChange}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="hasBonusPoints" className="block font-bold mb-2">
            Has Bonus Points
          </label>
          <input
            name="hasBonusPoints"
            type="checkbox"
            checked={currentQuiz.hasBonusPoints}
            onChange={handleBonusPointsChange}
          />
        </div>
        {currentQuiz.hasBonusPoints && (
          <div className="mb-4">
            <label htmlFor="maxBonusPoints" className="block font-bold mb-2">
              Max Bonus Points
            </label>
            <input
              name="maxBonusPoints"
              inputMode="numeric"
              type="number"
              value={currentQuiz.maxBonusPoints}
              onChange={handleMaxBonusPointsChange}
              className="w-full border p-2"
            />
          </div>
        )}
        {currentQuiz.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="mb-4 border p-4 rounded">
            <div className="mb-2">
              <label
                htmlFor={`questionTitle-${questionIndex}`}
                className="block font-bold mb-2"
              >
                Question Title
              </label>
              <input
                name="questionTitle"
                value={question.questionTitle}
                type="text"
                onChange={(e) => handleQuestionChange(questionIndex, e)}
                className="w-full border p-2"
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor={`questionTime-${questionIndex}`}
                className="block font-bold mb-2"
              >
                Question Time
              </label>
              <input
                name="questionTime"
                inputMode="numeric"
                value={question.questionTime}
                type="number"
                onChange={(e) => handleQuestionChange(questionIndex, e)}
                className="w-full border p-2"
              />
            </div>
            <div className="mb-2">
              <label
                htmlFor={`questionPoints-${questionIndex}`}
                className="block font-bold mb-2"
              >
                Question Points
              </label>
              <input
                name="questionPoints"
                inputMode="numeric"
                value={question.questionPoints}
                type="number"
                onChange={(e) => handleQuestionChange(questionIndex, e)}
                className="w-full border p-2"
              />
            </div>
            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="flex items-center mb-2">
                <label
                  htmlFor={`answer-${questionIndex}-${answerIndex}`}
                  className="block font-bold mr-2"
                >
                  Answer
                </label>
                <input
                  name="answer"
                  type="text"
                  value={answer.answer}
                  onChange={(e) =>
                    handleAnswerChange(questionIndex, answerIndex, e)
                  }
                  className="w-full border p-2"
                />
                <button
                  onClick={() => removeAnswerRow(questionIndex, answerIndex)}
                  className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                >
                  -
                </button>
              </div>
            ))}
            <div className="mb-2">
              <label
                htmlFor={`correct-answer-${questionIndex}`}
                className="block font-bold mb-2"
              >
                Correct Answer
              </label>
              <select
                name="correctAnswer"
                value={question.correctAnswer}
                onChange={(e) => handleCorrectAnswerChange(questionIndex, e)}
                className="w-full border p-2"
              >
                {question.answers.map((_, index) => (
                  <option key={index} value={index}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => addAnswerRow(questionIndex)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Add Answer
            </button>
            <button
              onClick={() => removeQuestionRow(questionIndex)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Remove Question
            </button>
          </div>
        ))}
        <button
          onClick={() => addQuestionRow()}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Add Question
        </button>
      </div>

      <button
        onClick={saveQuizData}
        className="bg-purple-500 text-white px-4 py-2 rounded"
      >
        Save Quiz Data
      </button>
    </div>
  );
};

export default DynamicForm;

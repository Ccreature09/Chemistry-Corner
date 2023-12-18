import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  DocumentData,
} from "firebase/firestore";

interface Question {
  id: string;
  questionTitle: string;
  questionTime: number;
  questionPoints: number;
  answers: string[];
  correctAnswer: number;
  photoURL?: string;
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

interface DynamicFormProps {
  editingQuizId: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ editingQuizId }) => {
  const [editingId, setEditingId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>({
    quizName: "",
    questionIntermission: 0,
    quizCode: 0,
    hasBonusPoints: false,
    maxBonusPoints: 0,
    questions: [
      {
        id: "",
        questionTitle: "",
        questionTime: 0,
        questionPoints: 0,
        answers: [""],
        correctAnswer: 0,
        photoURL: "", // New field for photo URL
      },
    ],
  });

  useEffect(() => {
    setEditingId(editingQuizId);
  }, [editingQuizId]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizDocRef = doc(db, "quizzes", editingId);
        const quizDocSnapshot = await getDoc(quizDocRef);

        if (quizDocSnapshot.exists()) {
          const quizData = quizDocSnapshot.data() as Quiz;

          const questionsRef = collection(db, `quizzes/${editingId}/questions`);
          const questionsSnapshot = await getDocs(questionsRef);
          const questionsData = questionsSnapshot.docs.map(function (doc) {
            const data = doc.data() as DocumentData;
            return {
              id: doc.id,
              ...data,
            } as Question;
          });
          setCurrentQuiz({
            questions: questionsData,
            quizName: quizData.quizName,
            quizCode: quizData.quizCode,
            questionIntermission: quizData.questionIntermission,
            hasBonusPoints: quizData.hasBonusPoints,
            maxBonusPoints: quizData.maxBonusPoints,
          });
        } else {
          console.error("Quiz not found");
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };

    if (editingId) {
      fetchQuizData();
    }
  }, [editingId]);

  const cancelEdit = () => {
    setEditingId("");
    resetForm();
  };
  const addQuestionRow = () => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions.push({
      id: "",
      questionTitle: "",
      questionTime: 0,
      questionPoints: 0,
      answers: [""],
      correctAnswer: 0,
    });
    setCurrentQuiz(updatedQuiz);
  };

  const removeQuestionRow = async (questionIndex: number) => {
    try {
      let updatedQuiz = { ...currentQuiz };
      const removedQuestion = updatedQuiz.questions.splice(questionIndex, 1)[0];
      setCurrentQuiz(updatedQuiz);

      if (editingId) {
        const questionsRef = collection(db, `quizzes/${editingId}/questions`);
        const questionId = removedQuestion.id;

        if (questionId) {
          const questionRef = doc(questionsRef, questionId);
          await deleteDoc(questionRef);
        }
      }
    } catch (error) {
      console.error("Error removing question:", error);
    }
  };

  const addAnswerRow = (questionIndex: number) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].answers.push("");
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

  const handlePhotoUpload = async (
    questionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];

      if (file) {
        const photoRef = ref(storage, `quizzes/photos`);
        const photoSnapshot = await uploadBytes(photoRef, file);
        const photoURL = await getDownloadURL(photoSnapshot.ref);

        let updatedQuiz = { ...currentQuiz };
        updatedQuiz.questions[questionIndex].photoURL = photoURL;
        setCurrentQuiz(updatedQuiz);
      } else {
        // If no file selected, set photoURL to null
        let updatedQuiz = { ...currentQuiz };
        updatedQuiz.questions[questionIndex].photoURL = undefined;
        setCurrentQuiz(updatedQuiz);
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };

  const subscriptMap: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉",
  };

  const processText = (text: string): string => {
    let processedText = text;

    // Replace _2 with subscript 2
    processedText = processedText.replace(/_([0-9])/g, (_, number) => {
      return subscriptMap[number] || number;
    });

    // Replace -> with arrow
    processedText = processedText.replace(/->/g, "→");

    // Replace →/ with ⇄
    processedText = processedText.replace(/(→\/)/g, "⇄");

    return processedText;
  };

  const handleQuestionChange = (
    questionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let updatedQuiz = { ...currentQuiz };

    const rawText = event.target.value;
    const processedText = processText(rawText);
    updatedQuiz.questions[questionIndex][event.target.name] =
      event.target.type === "number" ? +processedText : processedText;
    setCurrentQuiz(updatedQuiz);
  };

  const handleAnswerChange = (
    questionIndex: number,
    answerIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let updatedQuiz = { ...currentQuiz };
    const rawText = event.target.value;
    const processedText = processText(rawText);

    updatedQuiz.questions[questionIndex].answers[answerIndex] = processedText;
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
      if (editingId) {
        const quizRef = doc(db, "quizzes", editingId);
        await updateDoc(quizRef, {
          quizName: currentQuiz.quizName,
          quizCode: currentQuiz.quizCode,
          hasBonusPoints: currentQuiz.hasBonusPoints,
          maxBonusPoints: currentQuiz.maxBonusPoints,
          questionIntermission: currentQuiz.questionIntermission,
        });

        const questionsRef = collection(db, `quizzes/${editingId}/questions`);
        const questionsSnapshot = await getDocs(questionsRef);
        const questionIds = questionsSnapshot.docs.map((doc) => doc.id);

        for (let index = 0; index < currentQuiz.questions.length; index++) {
          const question = currentQuiz.questions[index];
          const questionId = questionIds[index];

          if (questionId) {
            const questionRef = doc(questionsRef, questionId);
            await updateDoc(questionRef, {
              questionTitle: question.questionTitle,
              photoURL: question.photoURL || null,
              questionTime: question.questionTime,
              possibleAnswers: question.answers.length,
              answers: question.answers.map((answer) => answer),
              correctAnswer: question.correctAnswer,
              questionPoints: question.questionPoints,
            });
          } else {
            await addDoc(questionsRef, {
              questionTitle: question.questionTitle,
              photoURL: question.photoURL || null,
              questionTime: question.questionTime,
              possibleAnswers: question.answers.length,
              answers: question.answers.map((answer) => answer),
              correctAnswer: question.correctAnswer,
              questionPoints: question.questionPoints,
            });
          }
        }
      } else {
        // If editingQuizId is not provided, add new quiz data
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
            photoURL: question.photoURL || null,
            questionTime: question.questionTime,
            possibleAnswers: question.answers.length,
            answers: question.answers.map((answer) => answer),
            correctAnswer: question.correctAnswer,
            questionPoints: question.questionPoints,
          });
        }
      }

      alert("Quiz data saved successfully");
      setEditingId("");
      resetForm();
    } else {
      alert("Form Invalid");
    }
  };

  const deleteImage = (questionIndex: number) => {
    let updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].photoURL = undefined;
    setCurrentQuiz(updatedQuiz);
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

      const hasBlankAnswer = question.answers.some((answer) => !answer);

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
          id: "",
          questionTitle: "",
          questionTime: 0,
          questionPoints: 0,
          answers: [""],
          correctAnswer: 0,
          photoURL: undefined,
        },
      ],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the input value to an empty string
      fileInputRef.current.defaultValue = ""; // Reset the default value to an empty string
      console.log(fileInputRef.current.value);
    }
  };

  return (
    <div className="container mx-auto my-10 p-6 bg-gray-100 shadow-md">
      <div className="mb-8 p-4 border rounded">
        <div className="mb-4">
          <Label htmlFor="quizName" className="block font-bold mb-2">
            Quiz име
          </Label>
          <Input
            name="quizName"
            value={currentQuiz.quizName}
            type="text"
            onChange={handleQuizChange}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <Label
            htmlFor="questionIntermission"
            className="block font-bold mb-2"
          >
            Пауза между въпросите (секунди)
          </Label>
          <Input
            name="questionIntermission"
            inputMode="numeric"
            value={currentQuiz.questionIntermission}
            type="number"
            onChange={handleQuizChange}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="quizCode" className="block font-bold mb-2">
            Quiz код
          </Label>
          <Input
            name="quizCode"
            value={currentQuiz.quizCode}
            inputMode="numeric"
            type="number"
            onChange={handleQuizChange}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="hasBonusPoints" className="block font-bold mb-2">
            Има бонус точки (спрямо времето)
          </Label>
          <Input
            name="hasBonusPoints"
            type="checkbox"
            checked={currentQuiz.hasBonusPoints}
            onChange={handleBonusPointsChange}
          />
        </div>
        {currentQuiz.hasBonusPoints && (
          <div className="mb-4">
            <Label htmlFor="maxBonusPoints" className="block font-bold mb-2">
              Максимален брой бонус точки
            </Label>
            <Input
              name="maxBonusPoints"
              inputMode="numeric"
              type="number"
              value={currentQuiz.maxBonusPoints}
              onChange={handleMaxBonusPointsChange}
              className="w-full border p-2"
            />
          </div>
        )}

        {currentQuiz.questions &&
          currentQuiz.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-4 border p-4 rounded">
              <div className="mb-2">
                <Label
                  htmlFor={`questionTitle-${questionIndex}`}
                  className="block font-bold mb-2"
                >
                  Въпрос
                </Label>
                <Input
                  name="questionTitle"
                  value={question.questionTitle}
                  type="text"
                  onChange={(e) => handleQuestionChange(questionIndex, e)}
                  className="w-full border p-2"
                />
              </div>
              <div className="mb-2">
                <Label
                  htmlFor={`photo-upload-${questionIndex}`}
                  className="block font-bold mb-2"
                >
                  Качи снимка
                </Label>
                <Input
                  key={editingId}
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(questionIndex, e)}
                  className="w-full border p-2"
                />
              </div>
              {currentQuiz.questions[questionIndex].photoURL && (
                <div className="my-3">
                  <img
                    src={currentQuiz.questions[questionIndex].photoURL}
                    alt={`Question ${questionIndex + 1}`}
                    className="max-w-full max-h-32"
                  />
                  <button
                    onClick={() => deleteImage(questionIndex)}
                    className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Изтрий снимката
                  </button>
                </div>
              )}
              <div className="mb-2">
                <Label
                  htmlFor={`questionTime-${questionIndex}`}
                  className="block font-bold mb-2"
                >
                  Време за решаване (секунди)
                </Label>
                <Input
                  name="questionTime"
                  inputMode="numeric"
                  value={question.questionTime}
                  type="number"
                  onChange={(e) => handleQuestionChange(questionIndex, e)}
                  className="w-full border p-2"
                />
              </div>
              <div className="mb-2">
                <Label
                  htmlFor={`questionPoints-${questionIndex}`}
                  className="block font-bold mb-2"
                >
                  Точки
                </Label>
                <Input
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
                  <Label
                    htmlFor={`answer-${questionIndex}-${answerIndex}`}
                    className="block font-bold mr-2"
                  >
                    Отговор
                  </Label>
                  <Input
                    name="answer"
                    type="text"
                    value={answer}
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
                <Label
                  htmlFor={`correct-answer-${questionIndex}`}
                  className="block font-bold mb-2"
                >
                  Правилен отговор
                </Label>
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
                className="bg-green-500 mr-2 mt-2 text-white px-2 py-1 rounded"
              >
                Добави отговор
              </button>
              <button
                onClick={() => removeQuestionRow(questionIndex)}
                className=" bg-red-500 mt-2 text-white px-2 py-1 rounded"
              >
                Изтрий въпрос
              </button>
            </div>
          ))}
        <button
          onClick={() => addQuestionRow()}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Добави въпрос
        </button>
      </div>

      <button
        onClick={saveQuizData}
        className="bg-purple-500 text-white px-4 py-2 mx-2 rounded"
      >
        {editingId ? "Редактирай Quiz" : "Създай Quiz"}
      </button>

      {editingId && (
        <button
          onClick={cancelEdit}
          className="bg-red-500 text-white mx-2 px-4 py-2 rounded"
        >
          Спри редакцията
        </button>
      )}
    </div>
  );
};

export default DynamicForm;

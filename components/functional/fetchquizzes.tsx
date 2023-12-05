import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { Quiz } from "@/interfaces";
import { Button } from "../ui/button";

interface FetchQuizzesProps {
  onEditQuiz: (quizId: string) => void;
}

const FetchQuizzes: React.FC<FetchQuizzesProps> = ({ onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const quizzesRef = collection(db, "quizzes");

    // Subscribe to real-time updates using onSnapshot
    const unsubscribe = onSnapshot(quizzesRef, (snapshot) => {
      const quizzesData: Quiz[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Quiz;
        return {
          id: doc.id,
          ...data,
        };
      });

      setQuizzes(quizzesData);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const quizDocRef = doc(db, "quizzes", quizId);
      await deleteDoc(quizDocRef);
      // Refresh the quiz list after deletion
      const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const handleStatusAction = async (quizId: string, quizStarted: boolean) => {
    try {
      const quizDocRef = doc(db, "quizzes", quizId);
      if (quizStarted) {
        // If starting the quiz, update the status only
        await updateDoc(quizDocRef, { quizStarted });
      } else {
        // If resetting the quiz, update the status and reset participants to []
        await updateDoc(quizDocRef, { quizStarted, participants: {} });
      }

      // Refresh the quiz list after updating the status
      const updatedQuizzes = quizzes.map((quiz) =>
        quiz.id === quizId ? { ...quiz, quizStarted } : quiz
      );
      setQuizzes(updatedQuizzes);
    } catch (error) {
      console.error(`Error updating quiz status to ${quizStarted}:`, error);
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-2xl m-5">Quizz-ове</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border w-80 p-4">
            <h3 className="text-center text-3xl mb-2">{quiz.quizName}</h3>
            <p className="text-center font-semibold text-2xl mb-2">
              Код: {quiz.quizCode}
            </p>
            <p className="text-center font-semibold mb-8">
              {quiz.quizStarted ? "Активен" : "Неактивен"}
            </p>
            <Button
              className="mx-2 mt-2 bg-green-500"
              onClick={() => handleStatusAction(quiz.id, true)}
            >
              Старт
            </Button>
            <Button
              className="mx-2 mt-2"
              onClick={() => handleStatusAction(quiz.id, false)}
            >
              Ресет
            </Button>
            <Button
              className="mx-2 mt-2 bg-blue-500"
              onClick={() => onEditQuiz(quiz.id)}
            >
              Редактирай
            </Button>

            <Button
              className="mx-2 mt-2 bg-red-500"
              onClick={() => handleDeleteQuiz(quiz.id)}
            >
              Изтрий
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FetchQuizzes;

import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Quiz } from "@/interfaces";
import { Button } from "../ui/button";

interface FetchQuizzesProps {
  onEditQuiz: (quizId: string) => void;
}

const FetchQuizzes: React.FC<FetchQuizzesProps> = ({ onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const quizzesRef = collection(db, "quizzes");
        const quizSnapshot = await getDocs(quizzesRef);

        const quizzesData: Quiz[] = quizSnapshot.docs.map((doc) => {
          const data = doc.data() as Quiz;
          return {
            id: doc.id,
            ...data,
          };
        });

        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
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

  return (
    <div>
      <h2 className="font-semibold text-2xl m-5">Quizzes</h2>
      <div className="grid grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border relative p-4">
            <h3 className="text-center text-3xl mb-2">{quiz.quizName}</h3>
            <p className="text-center mb-8">Код: {quiz.quizCode}</p>
            <Button
              className="absolute bottom-2 left-8"
              onClick={() => onEditQuiz(quiz.id)}
            >
              Edit
            </Button>
            <Button
              className="absolute bottom-2 right-8"
              onClick={() => handleDeleteQuiz(quiz.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FetchQuizzes;

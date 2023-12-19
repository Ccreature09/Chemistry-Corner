import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import {
  collection,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
  DocumentReference,
  DocumentData,
} from "firebase/firestore";
import { Quiz } from "@/interfaces";
import { Button } from "../ui/button";

interface FetchQuizzesProps {
  onEditQuiz: (quizId: string) => void;
}

const FetchQuizzes: React.FC<FetchQuizzesProps> = ({ onEditQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quizToDeleteId, setQuizToDeleteId] = useState<string | null>(null);

  // Function to handle opening the delete modal
  const handleOpenDeleteModal = (quizId: string) => {
    setIsDeleteModalOpen(true);

    // Store the quiz ID in state for reference when confirming deletion
    setQuizToDeleteId(quizId);
  };

  // Function to handle closing the delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  // Function to handle the actual delete action

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

  const handleDeleteQuiz = async () => {
    try {
      if (quizToDeleteId) {
        // Get a reference to the quiz document
        const quizDocRef = doc(db, "quizzes", quizToDeleteId);

        // Get a reference to the nested collection 'questions'
        const questionsCollectionRef = collection(quizDocRef, "questions");

        // Delete all documents inside the nested 'questions' collection
        const questionsQuerySnapshot = await getDocs(questionsCollectionRef);
        questionsQuerySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        // Delete the quiz document
        await deleteDoc(quizDocRef);

        // Refresh the quiz list after deletion
        const updatedQuizzes = quizzes.filter(
          (quiz) => quiz.id !== quizToDeleteId
        );
        setQuizzes(updatedQuizzes);
        setIsDeleteModalOpen(false);
        setQuizToDeleteId(null); // Reset the stored quiz ID
      }
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
            <p>{quiz.id}</p>
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
              className="bg-red-500"
              onClick={() => handleOpenDeleteModal(quiz.id)}
            >
              Изтрий
            </Button>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
              <div className="fixed z-10 inset-0 overflow-y-auto">
                <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                  <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                  </div>
                  <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                    &#8203;
                  </span>
                  <div
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden p-10 shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline"
                  >
                    <div className="modal-content">
                      <div className="modal-header flex justify-between items-center border-b pb-4 ">
                        <h3 className="modal-title text-3xl font-bold">
                          Изтрий Quiz
                        </h3>
                        <button
                          className="btn btn-clear"
                          onClick={handleCloseDeleteModal}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="modal-body mt-4">
                        <p className="text-xl">
                          Сигурна ли сте, че искате да изтриете Quiz-a?
                        </p>
                      </div>
                      <div className="modal-footer mt-4 flex justify-end">
                        <Button
                          className="m-auto w-full"
                          onClick={handleDeleteQuiz}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FetchQuizzes;

"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";
import next from "next";
interface Question {
  id: string;
  questionTitle: string;
  answers: string[];
  correctAnswer: number;
  points: number;
  possibleAnswers: number;
  questionTime: number;
}

interface Quiz {
  questions: Question[];
  quizName: string;
  questionIntermission: number;
}

interface UserScore {
  name: string;
  points: number;
}

const adminArray = [
  "KSca1U09jwMSIK0qYedXZDhe7d02",
  "6ok0udZR89QleRS7nlDC8jcNHFs2",
];

export default function Page({ params }: { params: { code: string } }) {
  const [quizCode, setQuizCode] = useState<string>(
    decodeURIComponent(params.code)
  );
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const [nextQuestionId, setNextQuestionId] = useState<string>("");
  const [time, setTime] = useState<number | null>(null);
  const [intermissionTime, setIntermissionTime] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null
  );
  const [score, setScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<UserScore[]>([]);
  const [isQuizEnded, setIsQuizEnded] = useState<boolean>(false);
  const [isWaitingLobby, setIsWaitingLobby] = useState<boolean>(true);
  const [users, setUsers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [answersDisabled, setAnswersDisabled] = useState<boolean>(false);

  const [bonusPointsEnabled, setBonusPointsEnabled] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, function (user) {
      if (user && adminArray.includes(user.uid)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  });

  useEffect(() => {
    async function fetchQuizAndQuestions() {
      const quizzesRef = collection(db, "quizzes");
      const quizQuery = query(
        quizzesRef,
        where("quizCode", "==", Number(quizCode))
      );
      const quizSnapshot = await getDocs(quizQuery);
      if (quizSnapshot.empty) {
        console.error("Quiz not found.");
        return;
      }
      const quizDoc = quizSnapshot.docs[0];
      const quizData = quizDoc.data();
      const questionsRef = collection(db, `quizzes/${quizDoc.id}/questions`);
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
        questionIntermission: quizData.questionIntermission,
      });

      setTime(questionsData[0]?.questionTime);
      setCurrentQuestionId(questionsData[0]?.id);
      setNextQuestionId(questionsData[1]?.id || "End of Quiz");

      // Get the participants from the quiz document
      const participants = quizData.participants;
      if (participants) {
        // Extract the user names and add them to the users state
        const userNames = Object.values(participants).map(function (
          participant: any
        ) {
          return participant.name;
        });
        setUsers(userNames);
      }
    }

    fetchQuizAndQuestions();

    const quizzesRef = collection(db, "quizzes");
    const quizQuery = query(
      quizzesRef,
      where("quizCode", "==", Number(quizCode))
    );
    const unsubscribe = onSnapshot(quizQuery, function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        if (doc.exists()) {
          const quizData = doc.data();
          const quizStarted = quizData.quizStarted;
          if (quizStarted) {
            // Quiz has started, hide the waiting lobby
            setIsWaitingLobby(false);
            // Set quizStarted to true when the quiz has started
            setQuizStarted(true);
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [quizCode]);

  const handleStartQuiz = async function () {
    try {
      // Query for the current quiz
      const quizzesRef = collection(db, "quizzes");
      const quizQuery = query(
        quizzesRef,
        where("quizCode", "==", Number(quizCode))
      );
      const quizSnapshot = await getDocs(quizQuery);

      if (quizSnapshot.empty) {
        console.error("Quiz not found.");
        return;
      }

      // Get the document reference for the current quiz
      const quizDoc = quizSnapshot.docs[0];
      const quizDocRef = doc(db, "quizzes", quizDoc.id);

      // Update the quizStarted field to true
      await updateDoc(quizDocRef, {
        quizStarted: true,
      });
    } catch (error) {
      console.error("Error starting quiz:", error);
    }
  };

  useEffect(() => {
    if (quizStarted && time && time > 0 && !isQuizEnded) {
      const timerId = setTimeout(function () {
        setTime(time - 1);
        setElapsedTime(elapsedTime + 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
    if (quizStarted && time === 0 && !showAnswer && !isQuizEnded) {
      setShowAnswer(true);
      setIntermissionTime(currentQuiz?.questionIntermission ?? 5);
      if (
        selectedAnswerIndex !== null &&
        currentQuiz &&
        currentQuestionIndex >= 0
      ) {
        const isCorrect =
          selectedAnswerIndex ===
          currentQuiz.questions[currentQuestionIndex].correctAnswer;
        if (isCorrect) {
          setScore(function (prevScore) {
            return (
              prevScore +
              currentQuiz.questions[currentQuestionIndex].points +
              (bonusPointsEnabled ? Math.max(0, 10 - elapsedTime) : 0)
            );
          });
        }
      }
      // Disable answers when the timer hits 0
      setAnswersDisabled(true);
    }
  }, [
    quizStarted,
    time,
    showAnswer,
    currentQuiz,
    currentQuestionIndex,
    selectedAnswerIndex,
    isQuizEnded,
    bonusPointsEnabled,
    elapsedTime,
  ]);

  useEffect(() => {
    if (
      quizStarted &&
      intermissionTime &&
      intermissionTime > 0 &&
      !isQuizEnded
    ) {
      const timerId = setTimeout(function () {
        setIntermissionTime(intermissionTime - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }
    if (quizStarted && intermissionTime === 0 && currentQuiz && !isQuizEnded) {
      setShowAnswer(false);
      setIsAnswered(false);
      setSelectedAnswerIndex(null);
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < currentQuiz.questions.length) {
        setCurrentQuestionIndex(nextIndex);
        setTime(currentQuiz.questions[nextIndex].questionTime);
        setCurrentQuestionId(currentQuiz.questions[nextIndex].id);
        setNextQuestionId(
          currentQuiz.questions[nextIndex + 1]?.id || "End of Quiz"
        );
      } else {
        handleEndOfQuiz();
        setIsQuizEnded(true);
      }
      setIntermissionTime(null);

      // Enable answers for the next question
      setAnswersDisabled(false); // Set answersDisabled to false
    }
  }, [
    quizStarted,
    intermissionTime,
    currentQuiz,
    currentQuestionIndex,
    isQuizEnded,
    answersDisabled, // Add answersDisabled as a dependency
  ]);

  const handleAnswerClick = function (index: number) {
    if (!isAnswered) {
      setSelectedAnswerIndex(index);
      setIsAnswered(true);
    }
  };

  async function handleEndOfQuiz() {
    setIsQuizEnded(true);
    const quizzesRef = collection(db, "quizzes");
    const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
    const quizSnapshot = await getDocs(q);
    if (quizSnapshot.empty) {
      console.error("Quiz not found.");
      return;
    }
    const quizData = quizSnapshot.docs[0].data();
    const participants = quizData.participants as Record<string, UserScore>;
    const scoresData = Object.values(participants);
    const topScores = scoresData
      .sort(function (a, b) {
        return b.points - a.points;
      })
      .slice(0, 3)
      .map(function (userScore) {
        return {
          name: userScore.name,
          points: userScore.points,
        };
      });
    setLeaderboard(topScores);
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center">
          {isWaitingLobby ? (
            // Display waiting lobby content here
            <div>
              <h2 className="text-4xl font-bold mb-5">
                Waiting for the quiz to start...
              </h2>
              {isAdmin && (
                <Button
                  className="bg-green-500 text-white py-2 px-4 rounded"
                  onClick={handleStartQuiz}
                >
                  Start Quiz
                </Button>
              )}
              <h3 className="text-2xl font-bold mt-5">Users:</h3>
              <ul className="text-xl">
                {users.map(function (user, index) {
                  return <li key={index}>{user}</li>;
                })}
              </ul>
            </div>
          ) : (
            // Display quiz content here
            <>
              {/* Question Timer */}
              {time !== null && !showAnswer && !isQuizEnded && (
                <div className="flex justify-center items-center bg-blue-300 w-20 h-20 rounded-full mx-auto my-10">
                  <p className="text-5xl text-white">{time}</p>
                </div>
              )}
              {/* Intermission Timer */}
              {intermissionTime !== null && showAnswer && !isQuizEnded && (
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold">
                    Next question in: {intermissionTime}
                  </p>
                </div>
              )}
              {/* Questions and Answers */}
              {!isQuizEnded &&
                currentQuiz &&
                currentQuiz.questions[currentQuestionIndex] && (
                  <div>
                    <h2 className="text-6xl font-bold mb-5">
                      {
                        currentQuiz.questions[currentQuestionIndex]
                          .questionTitle
                      }
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-10">
                      {currentQuiz?.questions[
                        currentQuestionIndex
                      ]?.answers.map(function (answer, index) {
                        return (
                          <Button
                            key={index}
                            className={`w-64 h-16 text-xl ${
                              index ===
                                currentQuiz?.questions[currentQuestionIndex]
                                  ?.correctAnswer && showAnswer
                                ? "bg-green-500"
                                : selectedAnswerIndex === index
                                ? "bg-yellow-500"
                                : "bg-blue-500 hover:bg-blue-700"
                            } text-white font-bold py-2 px-4 rounded`}
                            onClick={() => handleAnswerClick(index)}
                            disabled={isAnswered || answersDisabled} // Disable the button based on answersDisabled
                          >
                            {answer}
                          </Button>
                        );
                      })}
                    </div>
                    {currentQuiz &&
                      currentQuiz.questions[currentQuestionIndex] &&
                      showAnswer && (
                        <div className="text-green-500 text-4xl">
                          Correct Answer:{" "}
                          {
                            currentQuiz.questions[currentQuestionIndex].answers[
                              currentQuiz.questions[currentQuestionIndex]
                                .correctAnswer
                            ]
                          }
                        </div>
                      )}
                  </div>
                )}
            </>
          )}
        </div>
        {/* Score Display */}
        <div className="text-center">
          <h3 className="text-3xl font-bold">Score: {score}</h3>
        </div>
        {/* Leaderboard Display */}
        {isQuizEnded && (
          <div className="text-center mt-8">
            <h2 className="text-4xl font-bold mb-4">Leaderboard</h2>
            <ol>
              {leaderboard.map(function (user, index) {
                return (
                  <li key={index}>
                    {user.name}: {user.points} points
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

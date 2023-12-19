"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { DocumentData } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import Image from "next/image";
interface Question {
  id: string;
  questionTitle: string;
  photoURL: string;
  answers: string[];
  correctAnswer: number;
  questionPoints: number;
  possibleAnswers: number;
  questionTime: number;
}

interface Quiz {
  questions: Question[];
  quizName: string;
  hasBonusPoints: boolean;
  maxBonusPoints: number;
  questionIntermission: number;
}

interface Participant {
  name: string;
  points: number;
  hasAnswered: boolean;
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
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [isQuizEnded, setIsQuizEnded] = useState<boolean>(false);
  const [isWaitingLobby, setIsWaitingLobby] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [answersDisabled, setAnswersDisabled] = useState<boolean>(false);
  const [isNameEntered, setIsNameEntered] = useState<boolean>(false);
  const [initialQuizStarted, setInitialQuizStarted] = useState<boolean | null>(
    null
  );
  const [participantName, setParticipantName] = useState("");
  const router = useRouter();
  const [liveLeaderboard, setLiveLeaderboard] = useState<Participant[]>([]);

  useEffect(() => {
    // Fetch participants and update live leaderboard
    const fetchParticipantsAndLeaderboard = async () => {
      try {
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("Empty snapshot");
          setLiveLeaderboard([]);
        } else {
          const quizRef = doc(db, "quizzes", querySnapshot.docs[0].id);
          const unsubscribe = onSnapshot(quizRef, (docSnapshot) => {
            const data = docSnapshot.data();
            const participantsObj: Record<string, Participant> =
              data?.participants;

            const participantsArray =
              convertParticipantsMapToArray(participantsObj);
            setParticipants(participantsArray);

            // Update live leaderboard
            const scoresData = Object.values(participantsObj);
            const topScores = scoresData
              .sort((a, b) => b.points - a.points)
              .map((userScore) => ({
                name: userScore.name,
                points: userScore.points,
                hasAnswered: userScore.hasAnswered,
              }));

            setLiveLeaderboard(topScores);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchParticipantsAndLeaderboard();

    return () => {
      // Cleanup logic if needed
    };
  }, [quizCode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, function (user) {
      if (user && adminArray.includes(user.uid)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchQuizAndQuestions() {
      const quizzesRef = collection(db, "quizzes");
      const quizQuery = query(
        quizzesRef,
        where("quizCode", "==", Number(quizCode))
      );
      const quizSnapshot = await getDocs(quizQuery);
      if (quizSnapshot.empty) {
        router.push("/quiz");
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
        hasBonusPoints: quizData.hasBonusPoints,
        maxBonusPoints: quizData.maxBonusPoints,
      });

      setTime(questionsData[0]?.questionTime);
      setCurrentQuestionId(questionsData[0]?.id);
      setNextQuestionId(questionsData[1]?.id || "End of Quiz");
      const participants = quizData.participants;
      if (participants) {
        const userNames = Object.values(participants).map(function (
          participant: any
        ) {
          return participant.name;
        });
        setParticipants(userNames);
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
            setIsWaitingLobby(false);
            setQuizStarted(true);
            setInitialQuizStarted(true);
          } else {
            setInitialQuizStarted(false);
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [quizCode]);

  useEffect(() => {
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
          if (quizData.quizStarted) {
            if (!isNameEntered && !isAdmin) {
              router.push("/quiz");
              return;
            }
          }
          if (initialQuizStarted === null) {
            setInitialQuizStarted(quizStarted);
          }

          if (initialQuizStarted && !quizStarted) {
            window.location.reload();
          }
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, [quizCode, initialQuizStarted, isNameEntered]);

  useEffect(() => {
    const quizzesRef = collection(db, "quizzes");
    const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        console.error("Empty snapshot");
        setParticipants([]);
      } else {
        const quizRef = doc(db, "quizzes", querySnapshot.docs[0].id);
        const unsubscribe2 = onSnapshot(quizRef, (docSnapshot) => {
          const data = docSnapshot.data();
          const participantsObj: Record<string, Participant> =
            data?.participants;

          const participantsArray =
            convertParticipantsMapToArray(participantsObj);
          setParticipants(participantsArray);
        });

        return () => unsubscribe2();
      }
    });

    return () => unsubscribe();
  }, [quizCode]);
  function convertParticipantsMapToArray(
    participantsMap: Record<string, Participant> | undefined
  ) {
    if (!participantsMap) {
      return [];
    }

    const participantsArray = Object.entries(participantsMap).map(
      ([id, participant]) => ({
        id,
        name: participant.name,
        points: participant.points,
        hasAnswered: participant.hasAnswered,
      })
    );

    return participantsArray;
  }

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("Empty snapshot");
          setParticipants([]);
        } else {
          const quizRef = doc(db, "quizzes", querySnapshot.docs[0].id);
          const docSnapshot = await getDoc(quizRef);
          const data = docSnapshot.data();
          const participantsObj: Record<string, Participant> =
            data?.participants;

          const participantsArray =
            convertParticipantsMapToArray(participantsObj);
          setParticipants(participantsArray);
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchParticipants();

    return () => {
      const quizzesRef = collection(db, "quizzes");
      const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
      const unsubscribe = onSnapshot(q, () => {});
      unsubscribe();
    };
  }, [quizCode]);

  const handleStartQuiz = async function () {
    try {
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
      const quizDocRef = doc(db, "quizzes", quizDoc.id);

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
        setTime((prevTime) => (prevTime ? prevTime - 1 : 0));
        setElapsedTime((prevElapsedTime) =>
          prevElapsedTime ? prevElapsedTime + 1 : 1
        );
      }, 1000);
      return () => clearTimeout(timerId);
    }
    if (
      quizStarted &&
      time === 0 &&
      !showAnswer &&
      !isQuizEnded &&
      currentQuiz
    ) {
      setShowAnswer(true);
      setIntermissionTime(currentQuiz?.questionIntermission ?? 5);
      setAnswersDisabled(true);

      const nextQuestionTime =
        currentQuiz?.questions[currentQuestionIndex]?.questionTime;
      setTime(nextQuestionTime !== undefined ? nextQuestionTime : null);

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

      setAnswersDisabled(false);
    }
  }, [
    quizStarted,
    intermissionTime,
    currentQuiz,
    currentQuestionIndex,
    isQuizEnded,
    answersDisabled,
  ]);

  const handleAnswerClick = async function (index: number) {
    if (!isAnswered) {
      setSelectedAnswerIndex(index);
      setIsAnswered(true);
      updateParticipantAnswerStatus(participantName, true);

      const newScore =
        index === currentQuiz?.questions[currentQuestionIndex]?.correctAnswer
          ? score +
            currentQuiz.questions[currentQuestionIndex].questionPoints +
            (currentQuiz.hasBonusPoints
              ? Math.max(
                  0,
                  currentQuiz.maxBonusPoints *
                    (1 -
                      elapsedTime /
                        currentQuiz.questions[currentQuestionIndex]
                          .questionTime)
                )
              : 0)
          : score;
      const roundedScore = Math.round(newScore);
      setScore(roundedScore);
      updateParticipantScore(participantName, roundedScore, true);
    }
  };

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const quizzesRef = collection(db, "quizzes");
        const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
        const quizSnapshot = await getDocs(q);

        if (!quizSnapshot.empty) {
          const quizRef = doc(db, "quizzes", quizSnapshot.docs[0].id);
          const unsubscribe = onSnapshot(quizRef, (docSnapshot) => {
            const data = docSnapshot.data();
            const participantsObj: Record<string, Participant> =
              data?.participants;

            const allParticipantsAnswered = Object.values(
              participantsObj
            ).every((participant) => participant.hasAnswered);

            if (allParticipantsAnswered) {
              // Set the current question timer to 2 seconds for all participants
              setTime(2);

              // Reset hasAnswered to false for all participants
              resetParticipantsAnswerStatus();
            }
          });
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };

    fetchQuizData(); // Invoke the async function
  }, [quizCode]);

  const updateParticipantAnswerStatus = async (
    participantName: string,
    hasAnswered: boolean
  ) => {
    // Update hasAnswered for the current participant
    const updatedParticipants = participants?.map((participant) =>
      participant.name === participantName
        ? { ...participant, hasAnswered }
        : participant
    );

    setParticipants(updatedParticipants);

    // Update the Firebase Firestore document with the new participants data
    await updateParticipantsInFirestore(updatedParticipants);
  };

  const resetParticipantsAnswerStatus = async () => {
    try {
      // Fetch participants from Firestore
      const quizzesRef = collection(db, "quizzes");
      const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const quizRef = doc(db, "quizzes", querySnapshot.docs[0].id);
        const docSnapshot = await getDoc(quizRef);
        const data = docSnapshot.data();
        const participantsFromFirestore: Record<string, Participant> =
          data?.participants;

        // Reset hasAnswered to false for all participants
        const resetParticipants = Object.values(participantsFromFirestore).map(
          (participant) => ({
            ...participant,
            hasAnswered: false,
          })
        );
        resetParticipants.forEach((part) => {
          console.log([part.name + " " + part.points + " " + part.hasAnswered]);
        });

        setParticipants(resetParticipants);

        // Update the Firebase Firestore document with the new participants data
        const participantsToUpdate = resetParticipants?.map((participant) => ({
          name: participant.name!,
          hasAnswered: participant.hasAnswered!,
          points: participant.points, // Add other properties as needed
        }));

        await updateDoc(quizRef, {
          participants: participantsArrayToObject(participantsToUpdate),
        });
      }
    } catch (error) {
      console.error("Error resetting participants:", error);
    }
  };

  const updateParticipantsInFirestore = async (
    updatedParticipants?: Array<Partial<Participant>> | undefined
  ) => {
    try {
      const quizzesRef = collection(db, "quizzes");
      const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const quizRef = doc(db, "quizzes", querySnapshot.docs[0].id);

        updatedParticipants?.forEach((part) => {
          console.log([
            part.name + ", " + part.points + ", " + part.hasAnswered,
          ]);
        });

        const participantsToUpdate = updatedParticipants?.map(
          (participant) => ({
            name: participant.name!,
            hasAnswered: participant.hasAnswered!,
            points: participant.points ?? 0, // Add other properties as needed
          })
        );

        await updateDoc(quizRef, {
          participants: participantsArrayToObject(participantsToUpdate),
        });
      }
    } catch (error) {
      console.error("Error updating participants:", error);
    }
  };

  const participantsArrayToObject = (participantsArray?: Participant[]) => {
    return participantsArray?.reduce((acc, participant) => {
      acc[participant.name] = {
        name: participant.name,
        points: participant.points,
        hasAnswered: participant.hasAnswered,
      };
      return acc;
    }, {} as Record<string, Participant>);
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
    const participants = quizData.participants as Record<string, Participant>;
    const scoresData = Object.values(participants);
    const topScores = scoresData
      .sort(function (a, b) {
        return b.points - a.points;
      })

      .map(function (userScore) {
        return {
          name: userScore.name,
          points: userScore.points,
          hasAnswered: userScore.hasAnswered,
        };
      });

    setLeaderboard(topScores);

    updateParticipantScore(participantName, score, false);
  }

  const handleNameSubmit = async () => {
    try {
      const participantId = uuidv4();

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
      const quizDocRef = doc(db, "quizzes", quizDoc.id);

      const participantMap = quizDoc.data()?.participants || {};

      const quizStarted = quizDoc.data()?.quizStarted;
      if (quizStarted) {
        console.error("Quiz has already started. Cannot join now.");
        return;
      }

      if (!participantMap[participantId]) {
        participantMap[participantId] = {
          name: participantName,
          points: 0,
          hasAnswered: false,
        };

        await updateDoc(quizDocRef, {
          participants: participantMap,
        });
        setIsNameEntered(true);
      }
    } catch (error) {
      console.error("Error updating participant name:", error);
    }
  };

  const updateParticipantScore = async (
    participantName: string,
    newScore: number,
    hasAnswered: boolean = true
  ) => {
    try {
      const quizzesRef = collection(db, "quizzes");
      const q = query(quizzesRef, where("quizCode", "==", Number(quizCode)));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const quizRef = doc(db, "quizzes", querySnapshot.docs[0].id);
        const participantToUpdate = participants?.find(
          (participant) => participant.name === participantName
        );

        if (participantToUpdate) {
          participantToUpdate.points = newScore;
          participantToUpdate.hasAnswered = hasAnswered;

          await updateDoc(quizRef, {
            participants: participantsArrayToObject(participants),
          });

          const allParticipantsAnswered = participants?.every(
            (participant) => participant.hasAnswered
          );

          if (allParticipantsAnswered) {
            // Set the current question timer to 2 seconds for all participants
            setTime(2);

            // Reset hasAnswered to false for all participants
            resetParticipantsAnswerStatus();
          }
        }
      }
    } catch (error) {
      console.error("Error updating participant score:", error);
    }
  };

  const handleResetQuiz = async () => {
    try {
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
      const quizDocRef = doc(db, "quizzes", quizDoc.id);

      await updateDoc(quizDocRef, {
        quizStarted: false,
        participants: {},
      });

      window.location.reload();
    } catch (error) {
      console.error("Error resetting quiz:", error);
    }
  };

  const LiveLeaderboard = () => {
    return (
      <div className="text-center w-3/5">
        <h2 className="text-4xl md:text-7xl font-bold mb-32">Класация</h2>
        <div className="flex gap-2">
          {/* Display Podium - Silver, Gold, Bronze */}
          {liveLeaderboard.length >= 2 && (
            <div className="w-1/3 h-[300px] mt-[100px] bg-slate-400 text-white pt-5">
              <p className="text-xl md:text-3xl m-2 font-bold">2</p>
              <p className="text-2xl md:text-4xl font-semibold break-words">
                {liveLeaderboard[1].name}
              </p>
              <p className="text-xl md:text-2xl mt-4">
                {liveLeaderboard[1].points} точки
              </p>
            </div>
          )}

          {liveLeaderboard.length >= 1 && (
            <div className="w-1/3 h-[400px] bg-yellow-300 text-white pt-5">
              <p className="text-xl md:text-3xl m-2 font-bold">1</p>
              <p className="text-2xl md:text-4xl font-semibold break-words">
                {liveLeaderboard[0].name}
              </p>
              <p className="text-xl md:text-2xl mt-4">
                {liveLeaderboard[0].points} точки
              </p>
            </div>
          )}

          {liveLeaderboard.length >= 3 && (
            <div className="w-1/3 h-[200px] mt-[200px] bg-orange-400 text-white pt-5">
              <p className="text-xl md:text-3xl m-2 font-bold">3</p>
              <p className="text-2xl md:text-4xl font-semibold break-words">
                {liveLeaderboard[2].name}
              </p>
              <p className="text-xl md:text-2xl mt-4">
                {liveLeaderboard[2].points} точки
              </p>
            </div>
          )}
        </div>
        {liveLeaderboard.length > 3 && (
          <div className="mt-5">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Име</th>
                  <th className="px-4 py-2">Точки</th>
                </tr>
              </thead>
              <tbody>
                {liveLeaderboard.slice(3).map((user, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{index + 4}</td>
                    <td className="border px-4 py-2">{user.name}</td>
                    <td className="border px-4 py-2">{user.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAdmin && (
          <Button
            className="bg-red-500 text-white py-2 px-4 mt-5 rounded"
            onClick={handleResetQuiz}
          >
            Рестартирай Quiz
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center min-h-screen max-w-screen-lg mx-auto">
        <div className="text-center">
          {isWaitingLobby && !isAdmin ? (
            <div className="shadow-xl p-5 rounded-lg mx-5">
              <div>
                {!isNameEntered && (
                  <div className="mb-4 flex flex-col ">
                    <h1 className="font-bold text-4xl md:text-7xl mb-8 max-w-2xl mx-auto text-center break-words">
                      {currentQuiz?.quizName}
                    </h1>

                    <h2 className="text-xl md:text-4xl font-semibold mb-8">
                      Въведи име за да участваш в играта!
                    </h2>
                    <Input
                      type="text"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="Иван"
                      className="p-2 border rounded"
                    />
                  </div>
                )}
                {!isNameEntered && participantName && (
                  <Button
                    className="bg-green-500 text-white py-2 px-4 rounded md:py-3 md:px-6"
                    onClick={handleNameSubmit}
                  >
                    Влез в Quiz-a
                  </Button>
                )}
                {isNameEntered && (
                  <h2 className="text-4xl mx-5 font-semibold my-5">
                    Изчакваме учител да започне Quiz-a...
                  </h2>
                )}
              </div>
              <h3 className="text-2xl md:text-32xl font-bold underline mt-5">
                Участници:
              </h3>
              <ul className="text-xl md:text-2xl shadow-xl p-5 rounded-lg">
                {participants &&
                  participants.map((participant, index) => (
                    <li key={index}>{participant.name}</li>
                  ))}
              </ul>
            </div>
          ) : isWaitingLobby && isAdmin ? (
            <>
              <h1 className="font-bold text-4xl md:text-7xl mb-8 max-w-2xl mx-auto text-center break-words">
                {currentQuiz?.quizName}
              </h1>

              {!isQuizEnded && !quizStarted && (
                <>
                  <Button
                    className="bg-green-500 text-white py-2 px-4 mt-5 rounded"
                    onClick={handleStartQuiz}
                  >
                    Започни Quiz
                  </Button>
                </>
              )}
              <div className="p-4 shadow-xl ">
                <h3 className="text-2xl md:text-32xl font-bold underline mt-5">
                  Участници:
                </h3>
                <ul className="text-xl md:text-2xl shadow-xl p-5 rounded-lg">
                  {participants &&
                    participants.map((participant, index) => (
                      <li key={index}>{participant.name}</li>
                    ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Question Timer */}
              {time !== null && !showAnswer && !isQuizEnded && !isAdmin && (
                <div className="flex justify-center items-center bg-blue-300 w-36 h-36 rounded-full mx-auto my-3 md:w-20 mb-16 md:h-20">
                  <p className="text-5xl font-semibold md:text-5xl text-white">
                    {time}
                  </p>
                </div>
              )}
              {/* Intermission Timer */}
              {intermissionTime !== null &&
                showAnswer &&
                !isQuizEnded &&
                !isAdmin && (
                  <div className="text-center mt-4">
                    <p className="text-2xl mb-5 font-bold">
                      Следващ въпрос след: {intermissionTime}
                    </p>
                  </div>
                )}
              {/* Questions and Answers */}
              {!isQuizEnded &&
                !isAdmin &&
                currentQuiz &&
                currentQuiz.questions[currentQuestionIndex] && (
                  <div className="w-full">
                    <h2 className="text-3xl mx-8 text-left md:text-6xl font-bold mb-8">
                      {
                        currentQuiz.questions[currentQuestionIndex]
                          .questionTitle
                      }
                    </h2>
                    {currentQuiz.questions[currentQuestionIndex].photoURL && (
                      <img
                        src={
                          currentQuiz.questions[currentQuestionIndex].photoURL
                        }
                        alt={`Question ${currentQuestionIndex + 1}`}
                        className=" mx-auto h-80 mb-5"
                      />
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4 mb-10">
                      {currentQuiz?.questions[
                        currentQuestionIndex
                      ]?.answers.map(function (answer, index) {
                        return (
                          <Button
                            key={index}
                            className={`w-4/5 h-full px-36 mx-auto rounded text-xl text-white font-bold ${
                              index ===
                                currentQuiz?.questions[currentQuestionIndex]
                                  ?.correctAnswer && showAnswer
                                ? "bg-green-500"
                                : selectedAnswerIndex === index
                                ? "bg-yellow-500"
                                : "bg-blue-500 hover:bg-blue-700"
                            } `}
                            onClick={() => handleAnswerClick(index)}
                            disabled={isAnswered || answersDisabled}
                          >
                            {answer}
                          </Button>
                        );
                      })}
                    </div>
                    {/*   Correct Answer   */}
                    {currentQuiz &&
                      currentQuiz.questions[currentQuestionIndex] &&
                      showAnswer && (
                        <div className="   w-full">
                          <p className="mx-2 text-green-500 text-4xl">
                            Правилният отговор е:{" "}
                          </p>
                          <p className="font-bold text-3xl my-3 text-black underline">
                            {
                              currentQuiz.questions[currentQuestionIndex]
                                .answers[
                                currentQuiz.questions[currentQuestionIndex]
                                  .correctAnswer
                              ]
                            }
                          </p>

                          <div className="text-center">
                            <h3 className="text-3xl text-black font-bold">
                              Резултат: {score}
                            </h3>
                          </div>
                        </div>
                      )}
                  </div>
                )}
            </>
          )}
        </div>

        {isAdmin && !isWaitingLobby && <LiveLeaderboard />}

        {/* Leaderboard Display */}
        {isQuizEnded && (
          <div className="text-center w-3/5">
            <h2 className="text-4xl md:text-7xl font-bold mb-32">Класация</h2>
            <div className="flex gap-2">
              {/* Display Podium - Silver, Gold, Bronze */}
              {leaderboard.length >= 2 && (
                <div className="w-1/3 h-[300px] mt-[100px] bg-slate-400 text-white pt-5">
                  <p className="text-xl md:text-3xl m-2 font-bold">2</p>
                  <p className="text-2xl md:text-4xl font-semibold break-words">
                    {leaderboard[1].name}
                  </p>
                  <p className="text-xl md:text-2xl mt-4">
                    {leaderboard[1].points} точки
                  </p>
                </div>
              )}

              {leaderboard.length >= 1 && (
                <div className="w-1/3 h-[400px] bg-yellow-300 text-white pt-5">
                  <p className="text-xl md:text-3xl m-2 font-bold">1</p>
                  <p className="text-2xl md:text-4xl font-semibold break-words">
                    {leaderboard[0].name}
                  </p>
                  <p className="text-xl md:text-2xl mt-4">
                    {leaderboard[0].points} точки
                  </p>
                </div>
              )}

              {leaderboard.length >= 3 && (
                <div className="w-1/3 h-[200px] mt-[200px] bg-orange-400 text-white pt-5">
                  <p className="text-xl md:text-3xl m-2 font-bold">3</p>
                  <p className="text-2xl md:text-4xl font-semibold break-words">
                    {leaderboard[2].name}
                  </p>
                  <p className="text-xl md:text-2xl mt-4">
                    {leaderboard[2].points} точки
                  </p>
                </div>
              )}
            </div>
            {leaderboard.length > 3 && (
              <div className="mt-5">
                <table className="table-auto w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Име</th>
                      <th className="px-4 py-2">Точки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(3).map((user, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{index + 4}</td>
                        <td className="border px-4 py-2">{user.name}</td>
                        <td className="border px-4 py-2">{user.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {isAdmin && (
              <Button
                className="bg-red-500 text-white py-2 px-4 mt-5 rounded"
                onClick={handleResetQuiz}
              >
                Рестартирай Quiz
              </Button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuizLandingPage() {
  const [quizCode, setQuizCode] = useState("");
  const [quizError, setQuizError] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericQuizCode = Number(quizCode);
    if (isNaN(numericQuizCode)) {
      alert("Please enter a valid quiz code.");
      return;
    }

    const quizRef = collection(db, "quizzes");
    const q = query(quizRef, where("quizCode", "==", numericQuizCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setQuizError("");
      router.push(`/quiz/${quizCode}`);
    } else {
      setQuizError("Quiz с този код не съществува!");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen mx-3 ">
        <h1 className="mb-5 font-bold text-4xl text-center">
          Въведете Quiz код!
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        >
          <Input
            type="text"
            placeholder="Quiz код"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
          />
          {quizError != "" && <p className="text-red-500 mt-2">{quizError}</p>}
          <Button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Към Quiz-a
          </Button>
        </form>
      </div>
      <Footer />
    </>
  );
}

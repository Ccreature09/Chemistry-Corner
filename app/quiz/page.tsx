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
      router.push(`/quiz/${quizCode}`);
    } else {
      alert("Quiz does not exist.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="mb-5 font-bold text-4xl">
          Welcome! Enter a Quiz Code to get started!
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
        >
          <Input
            type="text"
            placeholder="Enter quiz code"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
          />
          <Button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            Join Quiz
          </Button>
        </form>
      </div>
      <Footer />
    </>
  );
}

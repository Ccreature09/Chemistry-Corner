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

    // Convert quizCode to a number before querying
    const numericQuizCode = Number(quizCode);
    if (isNaN(numericQuizCode)) {
      alert("Please enter a valid quiz code.");
      return;
    }

    const quizRef = collection(db, "quizzes");
    // Use numericQuizCode to query
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter quiz code"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            required
          />
          <Button type="submit">Join Quiz</Button>
        </form>
      </div>
      <Footer />
    </>
  );
}

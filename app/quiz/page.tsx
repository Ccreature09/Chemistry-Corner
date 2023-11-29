"use client";
<<<<<<< HEAD
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [time, setTime] = useState(10);

  useEffect(() => {
    if (time > 0) {
      const timerId = setTimeout(() => setTime(time - 1), 1000);

      return () => clearTimeout(timerId);
    }
  }, [time]);

  return (
    <>
      <Navbar></Navbar>
      <div className="my-10">
        <div className="w-96 h-44 flex justify-center items-center mx-auto my-6 p-10 bg-blue-300">
          <p className="text-7xl text-white">{time}</p>
        </div>
        <div className="flex">
          <p className="flex mx-auto">Колко е корен квадрат от 64</p>
        </div>
        <div className="flex mx-auto">
          <div className="flex-col mx-auto">
            <div className="flex mx-auto gap gap-5">
              <Button className="w-64 h-32"> Answer 1</Button>
              <Button className="w-64 h-32"> Answer 2</Button>
            </div>
            <div className="flex mx-auto mt-3 gap-5">
              <Button className="w-64 h-32"> Answer 3</Button>

              <Button className="w-64 h-32"> Answer 4</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer></Footer>
=======
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
>>>>>>> d9928d422fe57ed97748885881bde8d6aa2f72d5
    </>
  );
}

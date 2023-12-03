"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { Button } from "@/components/ui/button";
import OtpInput from "react-otp-input";

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
          <OtpInput
            value={quizCode}
            inputStyle={
              "border rounded-lg border-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            }
            onChange={setQuizCode}
            numInputs={6}
            inputType="number"
            containerStyle={"w-full text-4xl flex justify-center gap-2 "}
            shouldAutoFocus
            renderSeparator={<span> </span>}
            renderInput={(props) => <input {...props} />}
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

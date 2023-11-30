// QuizForm.js
import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";

const formSchema = z.object({
  quizName: z.string(),
  quizIntermission: z.number(),
  quizCode: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      answers: z.array(z.string()),
      correctAnswer: z.number(),
      points: z.number(),
      questionTime: z.number(),
    })
  ),
});

const QuizForm: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quizName: "",
      quizIntermission: 0,
      quizCode: "",
      questions: [
        {
          question: "",
          answers: ["", ""],
          correctAnswer: 0,
          points: 0,
          questionTime: 0,
        },
      ],
    },
  });

  const handleAddQuestion = () => {
    form.setValue("questions", [
      ...form.getValues().questions,
      {
        question: "",
        answers: ["", ""],
        correctAnswer: 0,
        points: 0,
        questionTime: 0,
      },
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...form.getValues().questions];
    updatedQuestions[index][field] = value;
    form.setValue("questions", updatedQuestions);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {};

  return (
    <>
      <Dialog>
        <DialogTrigger className="dark:bg-white mb-5 dark:text-black text-sm text-white bg-slate-900 dark:hover:bg-slate-50/90 hover:bg-slate-900/90 w-full py-2 rounded-md">
          Create Quiz
        </DialogTrigger>

        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-3 ">
                <FormField
                  control={form.control}
                  name="quizName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Quiz Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Quiz Name"
                          {...field}
                          className="w-full p-2 rounded border"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quizIntermission"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Quiz Intermission Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Intermission Time"
                          {...field}
                          className="w-full p-2 rounded border"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quizCode"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Quiz Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Quiz Code"
                          {...field}
                          className="w-full p-2 rounded border"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.getValues().questions.map((question, index) => (
                  <div key={index}>
                    <h3>Question {index + 1}</h3>
                    <FormField
                      control={form.control}
                      name={`questions[${index}].question`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Question"
                              {...field}
                              className="w-full p-2 rounded border"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions[${index}].answers`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Answers</FormLabel>
                          <FormControl>
                            {question.answers.map((answer, answerIndex) => (
                              <div key={answerIndex}>
                                <Input
                                  placeholder={`Answer ${answerIndex + 1}`}
                                  {...field}
                                  className="w-full p-2 rounded border"
                                />
                              </div>
                            ))}
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions[${index}].correctAnswer`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Correct Answer</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full p-2 rounded border"
                            >
                              {question.answers.map((_, answerIndex) => (
                                <option
                                  key={answerIndex}
                                  value={answerIndex}
                                >{`Option ${answerIndex + 1}`}</option>
                              ))}
                            </select>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions[${index}].points`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Points"
                              {...field}
                              className="w-full p-2 rounded border"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`questions[${index}].questionTime`}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Question Time</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Question Time"
                              {...field}
                              className="w-full p-2 rounded border"
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Add Question
                </Button>
              </div>
            </form>
            <DialogClose asChild>
              <Button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Submit Quiz
              </Button>
            </DialogClose>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuizForm;

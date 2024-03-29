"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { auth } from "@/firebase/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ForumMod } from "@/components/functional/forummod";
import EmbedForm from "@/components/functional/EmbedForm";
import FetchEmbeds from "@/components/functional/FetchEmbeds";
import PlanForm from "@/components/functional/planform";
import QuizForm from "@/components/functional/quizform";
import FetchQuizzes from "@/components/functional/fetchquizzes";
export default function AdminDashboard() {
  const router = useRouter();
  const [editingQuizId, setEditingQuizId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const adminArray = [
    "KSca1U09jwMSIK0qYedXZDhe7d02",
    "6ok0udZR89QleRS7nlDC8jcNHFs2",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminArray.includes(user.uid)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push("/");
      }
    });
    return () => unsubscribe();
  });

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="mx-auto p-4 max-w-screen-xl">
        {isAdmin && (
          <div className="container mx-auto p-4">
            <Tabs defaultValue="forum">
              <TabsList className="w-full mb-5 overflow-x-auto">
                <TabsTrigger value="forum">Форум</TabsTrigger>
                <TabsTrigger value="tests">Тестове</TabsTrigger>
                <TabsTrigger value="games">Игри</TabsTrigger>
                <TabsTrigger value="presentations">Презентации</TabsTrigger>
                <TabsTrigger value="comics">Комикси</TabsTrigger>
                <TabsTrigger value="useful-info">
                  Полезна Информация
                </TabsTrigger>

                <TabsTrigger value="plans">Планове</TabsTrigger>
                <TabsTrigger value="quizzes">Quizz-ове</TabsTrigger>

                <TabsTrigger value="settings">Настройки</TabsTrigger>
              </TabsList>
              <TabsContent value="forum">
                <ForumMod />
              </TabsContent>
              <TabsContent value="tests">
                <Tabs defaultValue="Grade 8">
                  <TabsList className="w-full mb-5">
                    <TabsTrigger value="Grade 8">8 клас</TabsTrigger>
                    <TabsTrigger value="Grade 9">9 клас</TabsTrigger>
                    <TabsTrigger value="Grade 10">10 клас</TabsTrigger>
                  </TabsList>
                  <TabsContent value="Grade 8">
                    <EmbedForm grade="grade-8" category="tests"></EmbedForm>
                    <FetchEmbeds
                      grade="grade-8"
                      category="tests"
                      admin
                    ></FetchEmbeds>
                  </TabsContent>
                  <TabsContent value="Grade 9">
                    <EmbedForm grade="grade-9" category="tests"></EmbedForm>
                    <FetchEmbeds
                      grade="grade-9"
                      category="tests"
                      admin
                    ></FetchEmbeds>
                  </TabsContent>
                  <TabsContent value="Grade 10">
                    <EmbedForm grade="grade-10" category="tests"></EmbedForm>
                    <FetchEmbeds
                      grade="grade-10"
                      category="tests"
                      admin
                    ></FetchEmbeds>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="games">
                <Tabs defaultValue="Grade 8">
                  <TabsList className="w-full mb-5">
                    <TabsTrigger value="Grade 8">8 клас</TabsTrigger>
                    <TabsTrigger value="Grade 9">9 клас</TabsTrigger>
                    <TabsTrigger value="Grade 10">10 клас</TabsTrigger>
                  </TabsList>
                  <TabsContent value="Grade 8">
                    <EmbedForm grade="grade-8" category="games"></EmbedForm>
                    <FetchEmbeds
                      grade="grade-8"
                      category="games"
                      admin
                    ></FetchEmbeds>
                  </TabsContent>
                  <TabsContent value="Grade 9">
                    <EmbedForm grade="grade-9" category="games"></EmbedForm>
                    <FetchEmbeds
                      grade="grade-9"
                      category="games"
                      admin
                    ></FetchEmbeds>
                  </TabsContent>
                  <TabsContent value="Grade 10">
                    <EmbedForm grade="grade-10" category="games"></EmbedForm>
                    <FetchEmbeds
                      grade="grade-10"
                      category="games"
                      admin
                    ></FetchEmbeds>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="presentations">
                <EmbedForm category="presentations"></EmbedForm>

                <FetchEmbeds category="presentations" admin />
              </TabsContent>
              <TabsContent value="comics">
                <EmbedForm category="comics"></EmbedForm>

                <FetchEmbeds category="comics" admin />
              </TabsContent>
              <TabsContent value="useful-info">
                <EmbedForm category="mindmaps"></EmbedForm>

                <FetchEmbeds category="mindmaps" admin />
              </TabsContent>
              <TabsContent value="plans">
                <PlanForm />
              </TabsContent>
              <TabsContent value="quizzes">
                <QuizForm editingQuizId={editingQuizId} />
                <FetchQuizzes
                  onEditQuiz={(quizId) => setEditingQuizId(quizId)}
                />
              </TabsContent>
              <TabsContent value="settings"></TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

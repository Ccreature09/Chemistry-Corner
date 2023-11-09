"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { auth } from "@/firebase/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Blogmod } from "@/components/functional/blogmod";
import EmbedForm from "@/components/functional/EmbedForm";

export default function AdminDashboard() {
  const router = useRouter();

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
      <div className="max-w-3xl mx-auto p-4">
        {isAdmin && (
          <div className="container mx-auto p-4">
            <Tabs defaultValue="Blog Moderation" className="">
              <TabsList className="w-full mb-5">
                <TabsTrigger value="Blog Moderation">
                  Blog Moderation
                </TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="Blog Moderation">
                <Blogmod />
              </TabsContent>
              <TabsContent value="tests">
                <Tabs defaultValue="grade-8">
                  <TabsList className="w-full mb-5">
                    <TabsTrigger value="Grade 8">Grade 8</TabsTrigger>
                    <TabsTrigger value="Grade 9">Grade 9</TabsTrigger>
                    <TabsTrigger value="Grade 10">Grade 10</TabsTrigger>
                  </TabsList>
                  <TabsContent value="Grade 8">
                    <p>Insert Grade 8 tests</p>
                    <EmbedForm grade="grade-8" category="tests"></EmbedForm>
                  </TabsContent>
                  <TabsContent value="Grade 9">
                    <p>Insert Grade 9 tests</p>
                    <EmbedForm grade="grade-9" category="tests"></EmbedForm>
                  </TabsContent>
                  <TabsContent value="Grade 10">
                    <p>Insert Grade 10 tests</p>
                    <EmbedForm grade="grade-10" category="tests"></EmbedForm>
                  </TabsContent>
                </Tabs>
              </TabsContent>
              <TabsContent value="games">
                <Tabs defaultValue="grade-8">
                  <TabsList className="w-full mb-5">
                    <TabsTrigger value="Grade 8">Grade 8</TabsTrigger>
                    <TabsTrigger value="Grade 9">Grade 9</TabsTrigger>
                    <TabsTrigger value="Grade 10">Grade 10</TabsTrigger>
                  </TabsList>
                  <TabsContent value="Grade 8">
                    <p>Insert Grade 8 games</p>
                    <EmbedForm grade="grade-8" category="games"></EmbedForm>
                  </TabsContent>
                  <TabsContent value="Grade 9">
                    <p>Insert Grade 9 games</p>
                    <EmbedForm grade="grade-9" category="games"></EmbedForm>
                  </TabsContent>
                  <TabsContent value="Grade 10">
                    <p>Insert Grade 10 games</p>
                    <EmbedForm grade="grade-10" category="games"></EmbedForm>
                  </TabsContent>
                </Tabs>
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

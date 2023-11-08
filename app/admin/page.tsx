"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { auth } from "@/firebase/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import "tailwindcss/tailwind.css";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Blogmod } from "@/components/functional/blogmod";

export default function AdminDashboard() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const adminArray = ["KSca1U09jwMSIK0qYedXZDhe7d02"];

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
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto p-4">
        {isAdmin && (
          <div className="container mx-auto p-4">
            <Tabs defaultValue="products" className="">
              <TabsList className="w-full mb-5">
                <TabsTrigger value="Blog Moderation">
                  Blog Moderation
                </TabsTrigger>
                <TabsTrigger value="addProduct">Add / Edit Product</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="Blog Moderation">
                <Blogmod />
              </TabsContent>
              <TabsContent value="addProduct"></TabsContent>
              <TabsContent value="orders"></TabsContent>
              <TabsContent value="settings"></TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

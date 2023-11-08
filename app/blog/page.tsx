"use client";
import React, { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  addDoc,
  where,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import BlogForm from "@/components/functional/blogform";
interface Article {
  id: string;
  author: string;
  content: string;
  status: string;
  createdAt: Timestamp;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    const articlesRef = collection(db, "articles");
    const q = where("status", "==", "approved");
    const articlesQuery = query(articlesRef, q);

    const unsubscribe = onSnapshot(articlesQuery, (querySnapshot) => {
      const articleList: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const article: Article = {
          id: doc.id,
          author: data.author,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt,
        };
        articleList.push(article);
      });
      setArticles(articleList);
    });

    return function cleanup() {
      unsubscribe();
    };
  }, []);
  const formatDate = (timestamp: Timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-based, so add 1
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minutes}`;
  };
  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="max-w-lg mx-auto">
          <BlogForm />

          <h2 className="text-2xl font-semibold mt-6">All Articles</h2>
          {articles.map((article, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded p-4 my-4"
            >
              <p className="text-lg font-semibold">{article.author}</p>
              <p className="text-gray-600 text-sm">
                {formatDate(article.createdAt)}
              </p>
              <p className="text-lg mt-2">{article.content}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

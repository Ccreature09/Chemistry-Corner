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
import { onAuthStateChanged, User } from "firebase/auth"; // Import 'Auth' from firebase/auth
import { auth, db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";

interface Article {
  id: string;
  author: string;
  content: string;
  status: string;
  createdAt: Timestamp;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]); // Specify the type for 'articles'
  const [newArticle, setNewArticle] = useState<string>(""); // Specify the type for 'newArticle'

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

  const handleArticleSubmit = () => {
    if (user) {
      const articlesRef = collection(db, "articles");
      addDoc(articlesRef, {
        author: user.displayName,
        content: newArticle,
        status: "pending",
        createdAt: serverTimestamp(),
      })
        .then(() => {
          setNewArticle("");
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }
  };

  return (
    <>
      {" "}
      <Navbar />
      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl bg-white p-6 rounded-lg shadow-md w-full">
          {user ? (
            <div>
              <p className="text-2xl font-semibold">
                Welcome, {user.displayName}
              </p>
              <textarea
                className="w-full h-32 border rounded-lg p-2 my-2"
                value={newArticle}
                onChange={(e) => setNewArticle(e.target.value)}
                placeholder="Write your article here..."
              />
              <button
                onClick={handleArticleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Submit Article
              </button>
            </div>
          ) : (
            <p className="text-lg font-semibold">
              Please sign in to submit articles.
            </p>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Approved Articles</h2>
            <ul>
              {articles.map((article, index) => (
                <li key={index} className="border-b border-gray-200 py-2">
                  {article.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

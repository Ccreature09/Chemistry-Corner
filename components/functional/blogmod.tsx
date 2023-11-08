import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";

import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  where,
  query,
  Timestamp,
} from "firebase/firestore";
import { Button } from "../ui/button";
interface Article {
  id: string;
  author: string;
  content: string;
  status: string;
  createdAt: Timestamp;
}

export const Blogmod = () => {
  const [articlesToApprove, setArticlesToApprove] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  useEffect(() => {
    // Fetch articles to approve
    const articlesRef = collection(db, "articles");
    const approveQuery = query(articlesRef, where("status", "==", "pending"));
    const approveUnsubscribe = onSnapshot(approveQuery, (querySnapshot) => {
      const pendingArticles: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const article: Article = {
          id: doc.id,
          author: data.author,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt,
        };
        pendingArticles.push(article);
      });
      setArticlesToApprove(pendingArticles);
    });

    // Fetch all articles
    const allQuery = query(articlesRef);
    const allUnsubscribe = onSnapshot(allQuery, (querySnapshot) => {
      const allArticlesList: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const article: Article = {
          id: doc.id,
          author: data.author,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt,
        };
        allArticlesList.push(article);
      });
      setAllArticles(allArticlesList);
    });

    return () => {
      approveUnsubscribe();
      allUnsubscribe();
    };
  }, []);

  const approveArticle = (articleId: string) => {
    const articleRef = doc(db, "articles", articleId);
    updateDoc(articleRef, {
      status: "approved",
    });
  };

  const rejectArticle = (articleId: string) => {
    const articleRef = doc(db, "articles", articleId);
    deleteDoc(articleRef)
      .then(() => {
        // Blog document deleted successfully
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  };

  const deleteAllArticle = (articleId: string) => {
    const articleRef = doc(db, "articles", articleId);
    deleteDoc(articleRef)
      .then(() => {
        // Blog document deleted successfully
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firebase timestamp to JavaScript Date
    return date.toLocaleString(); // Format the date as a string
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Articles to Approve</h2>
        <ul className="space-y-4">
          {articlesToApprove.map((article, index) => (
            <li
              key={index}
              className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center space-x-4"
            >
              <div>
                <p className="text-xl font-semibold">
                  Author: {article.author}
                </p>
                <p>{article.content}</p>
                <p>Date Submitted: {formatDate(article.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => approveArticle(article.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => rejectArticle(article.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold">All Articles</h2>
        <ul className="space-y-4">
          {allArticles.map((article, index) => (
            <li
              key={index}
              className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center space-x-4"
            >
              <div>
                <p className="text-xl font-semibold">
                  Author: {article.author}
                </p>
                <p>{article.content}</p>
                <p>Date Submitted: {formatDate(article.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => deleteAllArticle(article.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

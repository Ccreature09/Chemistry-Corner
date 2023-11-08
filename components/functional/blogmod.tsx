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
  title: string;
  author: string;
  content: string;
  status: string;
  createdAt: Timestamp;
}

export const Blogmod = () => {
  const [approvedArticles, setApprovedArticles] = useState<Article[]>([]);
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);

  useEffect(() => {
    const articlesRef = collection(db, "articles");
    const approvedQuery = query(articlesRef, where("status", "==", "approved"));
    const pendingQuery = query(articlesRef, where("status", "==", "pending"));

    const approvedUnsubscribe = onSnapshot(approvedQuery, (querySnapshot) => {
      const approvedArticlesList: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const article: Article = {
          id: doc.id,
          title: data.title,
          author: data.author,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt,
        };
        approvedArticlesList.push(article);
      });
      setApprovedArticles(approvedArticlesList);
    });

    const pendingUnsubscribe = onSnapshot(pendingQuery, (querySnapshot) => {
      const pendingArticlesList: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const article: Article = {
          id: doc.id,
          title: data.title,
          author: data.author,
          content: data.content,
          status: data.status,
          createdAt: data.createdAt,
        };
        pendingArticlesList.push(article);
      });
      setPendingArticles(pendingArticlesList);
    });

    return () => {
      approvedUnsubscribe();
      pendingUnsubscribe();
    };
  }, []);

  const approveArticle = (articleId: string) => {
    const articleRef = doc(db, "articles", articleId);
    updateDoc(articleRef, {
      status: "approved",
    })
      .then(() => {
        // Handle the approval success, you can update the UI as needed
      })
      .catch((error) => {
        console.error("Error approving document: ", error);
      });
  };

  const deleteArticle = (articleId: string) => {
    const articleRef = doc(db, "articles", articleId);
    deleteDoc(articleRef)
      .then(() => {})
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Pending Articles</h2>
        <ul className="space-y-4">
          {pendingArticles.map((article, index) => (
            <li
              key={index}
              className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center space-x-4"
            >
              <div>
                <p className="text-2xl font-bold">Title: {article.title}</p>
                <p className="text-xl font-semibold">
                  Author: {article.author}
                </p>
                <p>{article.content}</p>
                <p>Date Submitted: {formatDate(article.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => approveArticle(article.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover-bg-green-600"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => deleteArticle(article.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover-bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-semibold">Approved Articles</h2>
        <ul className="space-y-4">
          {approvedArticles.map((article, index) => (
            <li
              key={index}
              className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center space-x-4"
            >
              <div>
                <p className="text-2xl font-bold">Title: {article.title}</p>
                <p className="text-xl font-semibold">
                  Author: {article.author}
                </p>
                <p>{article.content}</p>
                <p>Date Submitted: {formatDate(article.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => deleteArticle(article.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover-bg-red-600"
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

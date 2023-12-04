import React, { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  pfp: string;
  content: string;
  status: string;
  createdAt: Timestamp;
}

export const ForumMod = () => {
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
          pfp: data.pfp,
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
          pfp: data.pfp,
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
      .then(() => {})
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
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-based, so add 1
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minutes}`;
  };

  return (
    <div className="p-4 space-y-4">
      {pendingArticles.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold">
            Публикации изчакващи удобрение
          </h2>
          <ul className="space-y-4">
            {pendingArticles.map((article, index) => (
              <li
                key={index}
                className="bg-white p-4 shadow-md rounded-lg flex mt-3 justify-between items-center space-x-4"
              >
                <div>
                  <p className="text-2xl md:text-4xl font-bold mb-2">
                    {article.title}
                  </p>
                  <div className="flex mb-2">
                    <Avatar>
                      <AvatarImage src={article.pfp} alt={article.author} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className="text-xl font-semibold my-auto mx-3 flex">
                      {article.author}
                    </p>
                  </div>

                  <p className="mb-2 text-lg">{article.content}</p>
                  <p>Дата: {formatDate(article.createdAt)}</p>

                  <div className="flex-col items-center space-x-4 mt-5">
                    <Button
                      onClick={() => approveArticle(article.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover-bg-green-600"
                    >
                      Удобри
                    </Button>
                    <Button
                      onClick={() => deleteArticle(article.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover-bg-red-600"
                    >
                      Изтрий
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold">Удобрени публикации</h2>
        <ul className="space-y-4">
          {approvedArticles.map((article, index) => (
            <li
              key={index}
              className="bg-white p-4 shadow-md rounded-lg flex justify-between items-center mt-3 space-x-4"
            >
              <div className="w-full break-words">
                <p className="text-2xl md:text-4xl font-bold mb-2">
                  {article.title}
                </p>
                <div className="flex mb-2">
                  <Avatar>
                    <AvatarImage src={article.pfp} alt={article.author} />
                  </Avatar>
                  <p className="text-xl font-semibold my-auto mx-3 flex">
                    {article.author}
                  </p>
                </div>

                <p className="mb-2 text-lg">{article.content}</p>
                <p>Дата: {formatDate(article.createdAt)}</p>
                <div className="flex items-center space-x-4 mt-5">
                  <Button
                    onClick={() => deleteArticle(article.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover-bg-red-600"
                  >
                    Изтрий
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

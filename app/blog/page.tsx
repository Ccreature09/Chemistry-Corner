"use client";
import React, { useEffect, useState } from "react";
import {
  Timestamp,
  collection,
  onSnapshot,
  where,
  query,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import BlogForm from "@/components/functional/blogform";
import { Input } from "@/components/ui/input";
import BlogComments from "@/components/functional/blogcomments";
import { Button } from "@/components/ui/button";

interface Article {
  id: string;
  author: string;
  title: string;
  queryTitle: string;
  uid: string;
  pfp: string;
  content: string;
  status: string;
  createdAt: Timestamp;
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const [isAdmin, setIsAdmin] = useState(false);
  const adminArray = [
    "KSca1U09jwMSIK0qYedXZDhe7d02",
    "6ok0udZR89QleRS7nlDC8jcNHFs2",
  ];

  useEffect(() => {
    handleSearch();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (adminArray.includes(user.uid)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleBlogDelete = async (articleId: string) => {
    try {
      await deleteDoc(doc(db, "articles", articleId));
      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== articleId)
      );
    } catch (error) {
      console.error("Error deleting blog: ", error);
    }
  };

  const handleSearch = async () => {
    const lowercaseQuery = searchQuery.toLowerCase();
    const blogRef = collection(db, "articles");
    const q = query(blogRef, where("queryTitle", ">=", lowercaseQuery));

    try {
      const querySnapshot = await getDocs(q);
      const articleData: Article[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Article;

        if (
          data.queryTitle.includes(lowercaseQuery) &&
          data.status === "approved"
        ) {
          const article: Article = {
            id: doc.id,
            title: data.title,
            queryTitle: data.queryTitle,
            uid: data.uid,
            pfp: data.pfp,
            author: data.author,
            content: data.content,
            status: data.status,
            createdAt: data.createdAt,
          };

          articleData.push(article);
        }
      });

      setSearchResults(articleData.slice(0, 3));
      console.log(searchResults);
    } catch (error) {
      console.error("Error searching for products: ", error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const articlesRef = collection(db, "articles");
    const articlesQuery = query(articlesRef, where("status", "==", "approved"));

    const unsubscribe = onSnapshot(articlesQuery, (querySnapshot) => {
      const articleList: Article[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const article: Article = {
          id: doc.id,
          title: data.title,
          queryTitle: data.queryTitle,
          uid: data.uid,
          pfp: data.pfp,
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

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-4">
        <div className="">
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              type="text"
              placeholder="Потърси..."
              className="w-full md:w-5/6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {user ? (
              <BlogForm />
            ) : (
              <div className="dark:bg-white  dark:text-black text-sm text-white bg-slate-900  w-full md:w-1/6 text-center my-auto p-2 font-semibold rounded-md">
                Sign in to Create blog
              </div>
            )}
          </div>
          {searchQuery.length < 2 && (
            <>
              <h2 className="text-3xl font-bold mt-6">Скорошни блогове</h2>

              {articles.map((article, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded p-4 my-4 relative" // Add relative positioning
                >
                  {user && (user.uid === article.uid || isAdmin) && (
                    <Button
                      onClick={() => handleBlogDelete(article.id)}
                      className="cursor-pointer absolute top-5 right-5" // Use absolute positioning
                    >
                      Delete Blog
                    </Button>
                  )}

                  <div className="flex">
                    <p className="text-4xl font-semibold mb-2">
                      {article.title}
                    </p>
                  </div>

                  <div className="flex mb-2">
                    <Avatar>
                      <AvatarImage src={article.pfp} alt={article.author} />
                      <AvatarFallback>PFP</AvatarFallback>
                    </Avatar>
                    <p className="text-lg flex my-auto mx-2 font-semibold">
                      {article.author}
                    </p>
                  </div>

                  <p className="text-gray-600 text-sm">
                    {article.createdAt.toDate().toLocaleString()}
                  </p>
                  <p className="text-lg mt-2">{article.content}</p>

                  {/* Integrate BlogComments component for each article */}
                  <BlogComments articleId={article.id} isAdmin={isAdmin} />
                </div>
              ))}
            </>
          )}

          {searchResults.length > 0 && searchQuery.length > 2 && (
            <>
              {searchResults.map((article) => (
                <div
                  key={article.title}
                  className="border border-gray-300 rounded p-4 my-4"
                >
                  <p className="text-4xl font-semibold mb-2">{article.title}</p>
                  <div className="flex mb-2">
                    <Avatar>
                      <AvatarImage src={article.pfp} alt={article.author} />
                      <AvatarFallback>PFP</AvatarFallback>
                    </Avatar>
                    <p className="text-lg flex my-auto mx-2 font-semibold">
                      {article.author}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {article.createdAt.toDate().toLocaleString()}
                  </p>
                  <p className="text-lg mt-2">{article.content}</p>

                  {/* Integrate BlogComments component for each article */}
                  <BlogComments articleId={article.id} isAdmin />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

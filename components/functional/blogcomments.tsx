import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  author: string;
  pfp: string;
  content: string;
  createdAt: Timestamp;
}

export default function BlogComments({
  articleId,
  isAdmin,
}: {
  articleId: string;
  isAdmin: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [latestComment, setLatestComment] = useState<Comment | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    fetchAllComments();
    onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, [articleId]);

  const fetchAllComments = async () => {
    if (!articleId) {
      console.error("Invalid articleId");
      return;
    }

    const commentsRef = collection(db, "articles", articleId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    try {
      const querySnapshot = await getDocs(q);
      const commentList: Comment[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const comment: Comment = {
          id: doc.id,
          author: data.author,
          pfp: data.pfp,
          content: data.content,
          createdAt: data.createdAt,
        };
        commentList.push(comment);
      });

      setAllComments(commentList);
      setLatestComment(commentList.length > 0 ? commentList[0] : null);
    } catch (error) {
      console.error("Error fetching comments: ", error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!isAdmin) {
      const commentToDelete = allComments.find(
        (comment) => comment.id === commentId
      );

      if (!commentToDelete || commentToDelete.author !== user?.displayName) {
        console.error("Unauthorized to delete this comment");
        return;
      }
    }

    try {
      await deleteDoc(doc(db, `articles/${articleId}/comments/${commentId}`));
      fetchAllComments();
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  const toggleShowAllComments = () => {
    setShowAllComments(!showAllComments);
  };

  const handleCommentSubmit = async () => {
    if (user && commentContent.trim() !== "") {
      const commentsRef = collection(db, "articles", articleId, "comments");

      try {
        await addDoc(commentsRef, {
          author: user.displayName,
          pfp: user.photoURL,
          content: commentContent,
          createdAt: Timestamp.now(),
        });

        // Fetch all comments again after submitting
        fetchAllComments();

        setCommentContent("");
      } catch (error) {
        console.error("Error adding comment: ", error);
      }
    }
  };

  return (
    <div>
      {latestComment && !showAllComments && (
        <div
          key={latestComment.id}
          className="border border-gray-300 rounded p-4 my-4"
        >
          <div className="flex mb-2">
            <Avatar>
              <AvatarImage src={latestComment.pfp} alt={latestComment.author} />
              <AvatarFallback>PFP</AvatarFallback>
            </Avatar>
            <p className="text-lg flex my-auto mx-2 font-semibold">
              {latestComment.author}
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            {latestComment.createdAt.toDate().toLocaleString()}
          </p>
          <p className="text-lg mt-2">{latestComment.content}</p>
          {isAdmin && (
            <button
              onClick={() => handleCommentDelete(latestComment.id)}
              className="text-red-500 cursor-pointer"
            >
              Delete Comment
            </button>
          )}
        </div>
      )}

      {showAllComments &&
        allComments.map((comment) => (
          <div
            key={comment.id}
            className="border border-gray-300 rounded p-4 my-4"
          >
            <div className="flex mb-2">
              <Avatar>
                <AvatarImage src={comment.pfp} alt={comment.author} />
                <AvatarFallback>PFP</AvatarFallback>
              </Avatar>
              <p className="text-lg flex my-auto mx-2 font-semibold">
                {comment.author}
              </p>
            </div>
            <p className="text-gray-600 text-sm">
              {comment.createdAt.toDate().toLocaleString()}
            </p>
            <p className="text-lg mt-2">{comment.content}</p>
            {isAdmin && (
              <button
                onClick={() => handleCommentDelete(comment.id)}
                className="text-red-500 cursor-pointer"
              >
                Delete Comment
              </button>
            )}
          </div>
        ))}

      {allComments.length >= 2 && (
        <button
          onClick={toggleShowAllComments}
          className="text-blue-500 cursor-pointer"
        >
          {!showAllComments
            ? "Покажи всички коментари"
            : "Скрий всички коментари"}
        </button>
      )}

      {user && (
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Добави коментар..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          />
          <Button
            onClick={handleCommentSubmit}
            className="mt-2 bg-blue-500 text-white rounded p-2"
          >
            Добави коментар
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-gray-500 mt-4">Регистрирай се за да коментираш...</p>
      )}
    </div>
  );
}

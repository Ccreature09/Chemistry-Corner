"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";

interface Presentation {
  title: string;
  embed: string;
}

export default function Page({ params }: { params: { id: string[] } }) {
  const [slug, setSlug] = useState(params.id);
  const [title, setTitle] = useState("");
  const [embedData, setEmbedData] = useState<Presentation>();

  useEffect(() => {
    if (slug) {
      const docRef = collection(db, "embeds", "presentations", "presentations");
      const q = query(docRef, where("title", "==", slug));

      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const docs = querySnapshot.docs[0];
            const embedData = docs.data() as Presentation;
            setTitle(embedData.title);
            setEmbedData(embedData);
          } else {
            console.error("Embed not found");
          }
        })
        .catch((error) => {
          console.error("Error fetching Embed: ", error);
        });
    }
  }, [slug]);

  return (
    <>
      <Navbar />
      {embedData && (
        <div className="max-w-3xl mx-auto p-4">
          <h2 className="text-3xl text-center font-bold mb-4">{title}</h2>
          <div
            className="mx-auto flex"
            dangerouslySetInnerHTML={{ __html: embedData.embed }}
          />
        </div>
      )}
      <Footer />
    </>
  );
}

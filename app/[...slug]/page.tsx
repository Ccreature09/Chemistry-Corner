"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";

interface Embed {
  title: string;
  embed: string;
}

export default function Page({ params }: { params: { slug: string[] } }) {
  const [slug, setSlug] = useState(params.slug);
  const [title, setTitle] = useState("");
  const [embedData, setEmbedData] = useState<Embed>();

  useEffect(() => {
    if (slug) {
      const docRef = collection(db, "embeds", slug[0], slug[1]);
      const q = query(
        docRef,
        where("title", "==", decodeURIComponent(slug[2]))
      );

      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const docs = querySnapshot.docs[0];
            const embedData = docs.data() as Embed;
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
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <div
            className="embed-container"
            dangerouslySetInnerHTML={{ __html: embedData.embed }}
          />
        </div>
      )}
      <Footer />
    </>
  );
}

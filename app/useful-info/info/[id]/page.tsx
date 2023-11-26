import React, { useEffect, useState } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";

interface Embed {
  title: string;
  embed: string;
}

export default function Page({ params }: { params: { slug: string } }) {
  const [title, setTitle] = useState("");
  const [embedData, setEmbedData] = useState<Embed | null>(null);

  useEffect(() => {
    const fetchMindmaps = async () => {
      const titleDecoded = decodeURIComponent(params.slug);
      const mindmapsRef = collection(db, "embeds", "mindmaps", "mindmap");
      const q = query(mindmapsRef, where("title", "==", titleDecoded));

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // Assuming there's only one mindmap with this title
          const mindmapData = querySnapshot.docs[0].data() as Embed;
          setTitle(mindmapData.title);
          setEmbedData(mindmapData);
        } else {
          console.error("No mindmap found with the title:", titleDecoded);
        }
      } catch (error) {
        console.error("Error fetching mindmaps: ", error);
      }
    };

    fetchMindmaps();
  }, [params.slug]);

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

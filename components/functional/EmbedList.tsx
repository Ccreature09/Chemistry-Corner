import React, { useEffect, useState } from "react";
import { collection, query, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import Link from "next/link";

interface Embed {
  title: string;
  slug: string;
}

interface EmbedListProps {
  grade: string;
  category: string;
}

const EmbedList: React.FC<EmbedListProps> = ({ grade, category }) => {
  const [embeds, setEmbeds] = useState<Embed[]>([]);

  const fetchEmbeds = async () => {
    const embedRef = collection(db, "embeds", category, grade);
    const embedsQuery = query(embedRef);

    try {
      const querySnapshot = await getDocs(embedsQuery);

      const embedsList: Embed[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        embedsList.push({
          title: data.title,
          slug: encodeURIComponent(data.title),
        });
      });

      console.log("Fetched Embeds:", embedsList); // Log the fetched embeds
      setEmbeds(embedsList);
    } catch (error) {
      console.error("Error fetching embeds: ", error);
    }
  };

  useEffect(() => {
    fetchEmbeds();
  }, [grade, category]);

  const handleDelete = async (slug: string) => {
    try {
      const embedDocRef = doc(
        db,
        "embeds",
        category,
        grade,
        decodeURIComponent(slug)
      );
      await deleteDoc(embedDocRef);
      // Refresh the list after deletion
      fetchEmbeds();
    } catch (error) {
      console.error("Error deleting embed: ", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {embeds.map((embed, index) => (
        <div
          key={index}
          className="border p-4 cursor-pointer hover:bg-gray-200"
        >
          <Link href={`/${category}/${grade}/${embed.slug}`}>
            <h3 className="text-xl font-semibold">{embed.title}</h3>
          </Link>
          <div className="flex mt-2 space-x-2">
            <button
              onClick={() => handleDelete(embed.slug)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
            {/* Add an edit button with a link to the edit page */}
            <Link href={`/edit/${category}/${grade}/${embed.slug}`}>
              <a className="text-blue-500 hover:underline">Edit</a>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmbedList;

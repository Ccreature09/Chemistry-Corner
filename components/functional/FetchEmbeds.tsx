import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import Image from "next/image";

interface Embed {
  title: string;
  embed: string;
  picture: string;
}

interface FetchEmbedsProps {
  grade?: string;
  category: "games" | "tests" | "presentations" | "comics" | "mindmaps";
  admin?: boolean;
}

const FetchEmbeds: React.FC<FetchEmbedsProps> = ({
  grade,
  category,
  admin = false,
}) => {
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const collectionName =
    category === "comics" && !grade
      ? "comics"
      : category === "presentations" && !grade
      ? "presentations"
      : category === "mindmaps" && !grade // Add condition for "mindmaps"
      ? "mindmaps"
      : category; // Default to the provided category
  const fetchEmbeds = async () => {
    const embedRef = collection(
      db,
      "embeds",
      collectionName,
      grade || (category == "mindmaps" && "mindmap") || category
    );
    const embedsQuery = query(embedRef);
    console.log(embedRef);
    try {
      const querySnapshot = await getDocs(embedsQuery);

      const embedsList: Embed[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const embed: Embed = {
          title: data.title,
          embed: data.embed,
          picture: data.picture,
        };
        embedsList.push(embed);
      });

      setEmbeds(embedsList);
    } catch (error) {
      console.error("Error fetching embeds: ", error);
    }
  };

  useEffect(() => {
    fetchEmbeds();
  }, [grade, category]);

  const handleDelete = async (title: string) => {
    try {
      const collectionName =
        category === "comics" && !grade
          ? "comics"
          : category === "presentations" && !grade
          ? "presentations"
          : category === "mindmaps" && !grade
          ? "mindmaps"
          : category;
      const embedRef = collection(
        db,
        "embeds",
        collectionName,
        grade || (category == "mindmaps" && "mindmap") || category
      );
      const q = query(embedRef, where("title", "==", title));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        await deleteDoc(docRef);

        fetchEmbeds();
      } else {
        console.error("Embed not found");
      }
    } catch (error) {
      console.error("Error deleting embed: ", error);
    }
  };

  return (
    <>
      <p className="text-center text-6xl font-bold my-3">
        {category === "games"
          ? "Игри за "
          : category === "tests"
          ? "Тестове за "
          : category === "presentations"
          ? "Презентации"
          : category === "comics"
          ? "Комикси"
          : category === "mindmaps"
          ? "Мисловни карти"
          : ""}
        {grade && grade === "grade-8"
          ? "8 клас"
          : grade && grade === "grade-9"
          ? "9 клас"
          : grade && grade === "grade-10"
          ? "10 клас"
          : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 m-10">
        {embeds.length > 0
          ? embeds.map((embed, index) => (
              <Card key={index}>
                <Link
                  href={`/${category}/${
                    grade
                      ? grade
                      : category === "comics"
                      ? "comic"
                      : category === "presentations"
                      ? "presentation"
                      : category === "mindmaps"
                      ? "mindmap"
                      : ""
                  }/${encodeURIComponent(embed.title)}`}
                >
                  <CardTitle className="text-center m-5">
                    {embed.title}
                  </CardTitle>
                  <CardContent>
                    <Image
                      src={embed.picture}
                      alt={embed.title}
                      width={400}
                      height={100}
                      className="rounded"
                    />
                  </CardContent>
                </Link>
                {admin && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => handleDelete(embed.title)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </Card>
            ))
          : Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="w-[450px] my-10 h-[500px]" />
            ))}
      </div>
    </>
  );
};

export default FetchEmbeds;

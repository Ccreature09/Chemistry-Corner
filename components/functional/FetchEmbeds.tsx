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
  grade: string;
  category: string;
  admin?: boolean;
}

const FetchEmbeds: React.FC<FetchEmbedsProps> = ({
  grade,
  category,
  admin = false,
}) => {
  const [embeds, setEmbeds] = useState<Embed[]>([]);
  const fetchEmbeds = async () => {
    const embedRef = collection(db, "embeds", category, grade);
    const embedsQuery = query(embedRef);

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
      const embedRef = collection(db, "embeds", category, grade);
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
        {grade} {category}
      </p>
      <div className=" m-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {embeds.length > 0
          ? embeds.map((embed, index) => (
              <Card key={index}>
                <Link
                  href={`/${category}/${grade}/${encodeURIComponent(
                    embed.title
                  )}`}
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
          : Array.from({ length: 16 }, (_, index) => (
              <Skeleton key={index} className="w-[450px] h-[500px]" />
            ))}
      </div>
    </>
  );
};

export default FetchEmbeds;

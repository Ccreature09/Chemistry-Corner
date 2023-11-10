import React, { useEffect, useState } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const FetchEmbeds: React.FC<FetchEmbedsProps> = ({ grade, category }) => {
  const [embeds, setEmbeds] = useState<Embed[]>([]);

  useEffect(() => {
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

    fetchEmbeds();
  }, [grade, category]);

  return (
    <>
      <p className="text-center text-6xl font-bold my-3">
        {grade} {category}
      </p>
      <div className=" m-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {embeds.length > 0 ? (
          embeds.map((embed, index) => (
            <Link
              href={`/${category}/${grade}/${encodeURIComponent(embed.title)}`}
              key={index}
            >
              <Card>
                <CardTitle className="text-center my-3">
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
              </Card>
            </Link>
          ))
        ) : (
          <>
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
            <Skeleton className="w-[450px] h-[500px]" />
          </>
        )}
      </div>
    </>
  );
};

export default FetchEmbeds;

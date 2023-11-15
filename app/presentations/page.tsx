"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import FetchEmbeds from "@/components/functional/FetchEmbeds";
interface Presentation {
  embed: string;
  picture: string;
  title: string;
}

export const getPresentations = async () => {
  const presentationsCol = collection(
    db,
    "embeds",
    "presentations",
    "presentations"
  );
  const presentationSnapshot = await getDocs(query(presentationsCol));
  const presentationList: Presentation[] = presentationSnapshot.docs.map(
    (doc) => doc.data() as Presentation
  );
  return presentationList;
};

export default function Page() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentPresentationIndex, setCurrentPresentationIndex] = useState(0);

  useEffect(() => {
    const fetchPresentations = async () => {
      const data = await getPresentations();
      setPresentations(data);
    };

    fetchPresentations();
  }, []);

  const handleNext = () => {
    setCurrentPresentationIndex((prevIndex) =>
      prevIndex < presentations.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevious = () => {
    setCurrentPresentationIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  return (
    <>
      <Navbar></Navbar>
      <FetchEmbeds category="presentations"></FetchEmbeds>
      <Footer></Footer>
    </>
  );
}

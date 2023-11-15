"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
export const getPresentations = async () => {
  const presentationsCol = collection(db, "presentations");
  const presentationSnapshot = await getDocs(presentationsCol);
  const presentationList = presentationSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return presentationList;
};

const Presentations = () => {
  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    const fetchPresentations = async () => {
      const data = await getPresentations();
      setPresentations(data);
    };

    fetchPresentations();
  }, []);

  return (
    <>
      <Navbar></Navbar>
      {presentations.map((presentation, index) => (
        <Link key={index} href={`/presentations/${presentation.id}`}>
          <a>
            <img src={presentation.imageUrl} alt={presentation.title} />
            <h2>{presentation.title}</h2>
          </a>
        </Link>
      ))}
      <Footer></Footer>
    </>
  );
};

export default Presentations;

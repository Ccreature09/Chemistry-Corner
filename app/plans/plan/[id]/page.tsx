"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase/firebase"; // Adjust import based on your firebase config
import {
  collection,
  getDocs,
  where,
  query,
  QuerySnapshot,
} from "firebase/firestore";
import Image from "next/image";
interface Plan {
  name: string;
  mainPicture: string;
  images: string[];
}

interface Page {
  src: string;
  alt: string;
}

export default function Page({ params }: { params: { id: string } }) {
  const [slug, setSlug] = useState<string>(decodeURIComponent(params.id));
  const [title, setTitle] = useState("");
  const [plan, setPlan] = useState<Plan>();
  const [pages, setPages] = useState<Page[]>([]);

  const Book: React.FC = () => {
    const [pages, setPages] = useState<Page[]>([]);
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
    };

    useEffect(() => {
      const fetchPlan = async () => {
        const plansRef = collection(db, "plans");
        const q = query(plansRef, where("name", "==", slug));

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const planData = querySnapshot.docs[0].data() as Plan;
            const planPages: Page[] = planData.images.map((image) => ({
              src: image,
              alt: planData.name,
            }));
            setPages(planPages);
          }
        } catch (error) {
          console.error("Error fetching plan:", error);
        }
      };

      fetchPlan();
    }, [slug]);

    return (
      <div className=" lg:w-3/5 w-4/5 mx-auto mt-10">
        <Slider {...settings}>
          {pages.map((page, index) => (
            <div key={index}>
              <Image
                src={page.src}
                alt={page.alt}
                width={1000}
                className="w-full shadow-xl"
                height={1000}
              />
            </div>
          ))}
        </Slider>
        <p className="text-center text-5xl my-10 font-semibold ">
          Плъзни на ляво или на дясно
        </p>
      </div>
    );
  };
  return (
    <>
      <Navbar></Navbar>
      <Book></Book>
      <Footer></Footer>
    </>
  );
}

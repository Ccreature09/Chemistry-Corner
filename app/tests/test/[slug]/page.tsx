"use client";
import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
export default function Page({ params }: { params: { slug: string } }) {
  const [slug, setSlug] = useState(params.slug);
  const [name, setName] = useState(params.slug);

  useEffect(() => {
    if (slug) {
      setName(decodeURIComponent(slug as string));
    }
  }, [slug]);
  return (
    <>
      <Navbar />
      <p>{name}</p>
      <Footer />
    </>
  );
}

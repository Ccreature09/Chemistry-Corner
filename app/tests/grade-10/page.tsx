"use client";
import React from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import FetchEmbeds from "@/components/functional/FetchEmbeds";

export default function Page() {
  return (
    <>
      <Navbar />
      <FetchEmbeds category="tests" grade="grade-10"></FetchEmbeds>
      <Footer />
    </>
  );
}

"use client";

import React from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import FetchEmbeds from "@/components/functional/FetchEmbeds";
export default function Page() {
  return (
    <>
      <Navbar />
      <FetchEmbeds category="mindmaps"></FetchEmbeds>
      <Footer />
    </>
  );
}

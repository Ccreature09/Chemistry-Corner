"use client";

import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import FetchEmbeds from "@/components/functional/FetchEmbeds";

export default function Page() {
  return (
    <>
      <Navbar></Navbar>
      <FetchEmbeds category="presentations"></FetchEmbeds>
      <Footer></Footer>
    </>
  );
}

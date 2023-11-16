"use client";

import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import FetchPlans from "@/components/functional/FetchPlans";
export default function Page() {
  return (
    <>
      <Navbar></Navbar>
      <FetchPlans></FetchPlans>
      <Footer></Footer>
    </>
  );
}

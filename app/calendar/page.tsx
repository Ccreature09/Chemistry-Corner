"use client";
import Calendar from "@/components/functional/calendar";
import { Footer } from "@/components/functional/footer";
import { Navbar } from "@/components/functional/navbar";
export default function page() {
  return (
    <>
      <Navbar />
      <div className="m-4">
        <Calendar />
      </div>
      <Footer />
    </>
  );
}

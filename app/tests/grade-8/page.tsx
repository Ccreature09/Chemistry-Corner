import React from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
export default function Page() {
  return (
    <>
      <Navbar />
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSdzOCqgh2CCxxXFaRCDNEk3nFf-AlAcaZ-1qdME1xB3NDNXiA/viewform?embedded=true"
        width="640"
        height="1861"
        className="mx-auto"
      >
        Loading…
      </iframe>
      <Footer />
    </>
  );
}

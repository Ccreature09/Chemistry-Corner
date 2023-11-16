"use client";
import { motion } from "framer-motion";
import { useState, FC } from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";

interface PageProps {
  content: string;
  isFlipped: boolean;
}

const Page: FC<PageProps> = ({ content, isFlipped }) => {
  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 1 }}
      style={{
        position: "absolute",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        // Additional styles for the page...
      }}
    >
      {content}
    </motion.div>
  );
};

const Book: FC = () => {
  const [pages, setPages] = useState([
    { content: "Page 1 Content", isFlipped: false },
    { content: "Page 2 Content", isFlipped: false },
    { content: "Page 3 Content", isFlipped: false },
    // Add more pages as needed
  ]);

  const flipPage = (pageIndex: number) => {
    setPages((pages) =>
      pages.map((page, index) =>
        index === pageIndex ? { ...page, isFlipped: !page.isFlipped } : page
      )
    );
  };

  return (
    <>
      <Navbar />
      <div style={{ perspective: "1000px" }}>
        {pages.map((page, index) => (
          <div key={index} onClick={() => flipPage(index)}>
            <Page content={page.content} isFlipped={page.isFlipped} />
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Book;

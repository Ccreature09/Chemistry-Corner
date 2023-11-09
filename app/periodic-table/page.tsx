import React from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";

const elements = [
  {
    atomicNumber: 1,
    symbol: "H",
    name: "Hydrogen",
    atomicWeight: 1.008,
    group: "1",
    period: 1,
  },
  {
    atomicNumber: 2,
    symbol: "He",
    name: "Helium",
    atomicWeight: 4.0026,
    group: "18",
    period: 1,
  },
  // Add more elements as needed
];

const Page = () => {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Periodic Table</h1>
        <div className="grid grid-cols-18 gap-1">
          {elements.map((element) => (
            <div
              key={element.atomicNumber}
              className="p-2 border border-gray-400 rounded-lg flex flex-col justify-between"
            >
              <div className="text-2xl font-bold text-center">
                {element.symbol}
              </div>
              <div className="text-sm text-center">{element.atomicNumber}</div>
              <div className="text-xs text-center">Group: {element.group}</div>
              <div className="text-xs text-center">
                Period: {element.period}
              </div>
              <div className="text-xs text-center">
                Atomic Weight: {element.atomicWeight}
              </div>
              <div className="text-xs text-center">{element.name}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;

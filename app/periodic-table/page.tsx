"use client";
import React, { useState } from "react";
import { Navbar } from "@/components/functional/navbar";
import { Footer } from "@/components/functional/footer";
import { Button } from "@/components/ui/button";
import { Divide } from "lucide-react";
var pt = require("periodic-table");

interface ElementTableProps {
  elements: (Element | null)[];
  onElementClick: (element: Element | null) => void;
}

interface Element {
  atomicMass: string;
  atomicNumber: number;
  atomicRadius: number;
  boilingPoint: number;
  bondingType: string;
  cpkHexColor: string;
  density: number;
  electronAffinity: number;
  electronegativity: number;
  electronicConfiguration: string;
  groupBlock: string;
  ionRadius: string;
  ionizationEnergy: number;
  meltingPoint: number;
  name: string;
  oxidationStates: string;
  standardState: string;
  symbol: string;
  vanDelWaalsRadius: number;
  yearDiscovered: string;
}

const ElementGrid: React.FC<ElementTableProps> = ({
  elements,
  onElementClick,
}) => {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const renderCell = (element: Element | null, index: number) => (
    <div
      key={index}
      className="grid-cell"
      onClick={() => {
        element && onElementClick(element);
      }}
    >
      {element ? (
        <div
          className={`border-2 border-blue-400 shadow-xl relative w-24 h-24 flex flex-col items-center justify-center hover:scale-150 hover:text-white hover:cursor-pointer transform hover:bg-blue-500 hover:z-10 transition-transform duration-200 ${
            selectedElement === element ? "bg-gray-300" : ""
          }`}
        >
          <p className="absolute left-1 top-1">{element.atomicNumber}</p>
          <p className="text-xl font-semibold">{element.symbol}</p>
          <p className="text-xs">{element.name}</p>
        </div>
      ) : (
        <div className="w-24 h-24 flex items-center justify-center" />
      )}
    </div>
  );

  const renderRow = (
    start: number,
    end: number,
    startSplice?: number,
    spliceCount?: number,
    deleteCount?: number
  ) => {
    const modifiedElements = [...elements];
    startSplice &&
      spliceCount &&
      modifiedElements.splice(
        startSplice,
        deleteCount ? deleteCount : 0,
        ...new Array(spliceCount).fill(null)
      );

    return (
      <div className="flex gap-2">
        {modifiedElements
          .slice(start, end)
          .map((element, index) => renderCell(element, start + index))}
      </div>
    );
  };

  return (
    <div className="element-grid grid grid-cols-18 gap-4 max-w-[1920] overflow-x-auto">
      {renderRow(0, 18, 1, 16)}
      {renderRow(2, 20, 4, 10)}
      {renderRow(10, 28, 12, 10)}
      {renderRow(18, 36)}
      {renderRow(36, 54)}
      {renderRow(54, 72, 56, 1, 15)}
      {renderRow(86, 104, 88, 1, 15)}
      {renderRow(57, 75, 56, 4)}
      {renderRow(89, 107, 88, 4)}
    </div>
  );
};

const Page: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [shortDescription, setShortDescription] = useState<boolean>(false);

  const handleElementClick = (element: Element | null) => {
    setSelectedElement(element);
    setIsModalOpen(true);
  };
  const elements = pt.all();
  const emptyCells = new Array(118 - elements.length).fill(null);

  return (
    <>
      <Navbar />

      <div className="p-4">
        <h1 className="text-5xl text-blue-500 font-semibold mb-4 text-center">
          Периодична Таблица
        </h1>
        <ElementGrid
          elements={[...elements, ...emptyCells]}
          onElementClick={handleElementClick}
        />
      </div>
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white rounded-lg p-10 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="modal-content">
                <div className="modal-header flex justify-between items-center border-b pb-4 ">
                  <h3 className="modal-title text-3xl font-bold">
                    {selectedElement?.name}
                  </h3>
                  <Button
                    className="btn btn-clear"
                    onClick={() => {
                      setShortDescription(true);
                      if (shortDescription) {
                        setShortDescription(false);
                      }
                    }}
                  >
                    {shortDescription ? "Short" : "Long"}
                  </Button>
                  <Button
                    className="btn btn-clear"
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
                {shortDescription ? (
                  <div className="modal-body mt-4">
                    <p className="text-lg">
                      Also known as{" "}
                      <span className="font-semibold">
                        {selectedElement?.symbol}
                      </span>
                      .
                      <br /> It has an atomic number of{" "}
                      <span className="font-semibold">
                        {selectedElement?.atomicNumber}
                      </span>{" "}
                      and an atomic mass of{" "}
                      <span className="font-semibold">
                        {selectedElement?.atomicMass} amu
                      </span>{" "}
                      . This element belongs to the{" "}
                      <span className="font-semibold">
                        {selectedElement?.groupBlock}
                      </span>{" "}
                      group and has a density of{" "}
                      <span className="font-semibold">
                        {selectedElement?.density} g/cm³
                      </span>{" "}
                      . Its boiling point is{" "}
                      <span className="font-semibold">
                        {selectedElement?.boilingPoint} K
                      </span>{" "}
                      , and it exhibits a{" "}
                      <span className="font-semibold">
                        {selectedElement?.bondingType}
                      </span>{" "}
                      bonding type. <br />
                      {selectedElement?.yearDiscovered == "Ancient"
                        ? `${selectedElement?.name} is Ancient.`
                        : `${
                            selectedElement?.name
                          } was discovered in the year ${" "}
                    ${selectedElement?.yearDiscovered}. `}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg">
                      Symbol:{" "}
                      <span className="font-semibold">
                        {selectedElement?.symbol}
                      </span>
                      <br />
                      Atomic Number:{" "}
                      <span className="font-semibold">
                        {selectedElement?.atomicNumber}
                      </span>{" "}
                      <br />
                      Atomic Mass:{" "}
                      <span className="font-semibold">
                        {selectedElement?.atomicMass} amu
                      </span>{" "}
                      <br /> Group:{" "}
                      <span className="font-semibold">
                        {selectedElement?.groupBlock}
                      </span>{" "}
                      <br />
                      Density:{" "}
                      <span className="font-semibold">
                        {selectedElement?.density} g/cm³
                      </span>{" "}
                      <br />
                      Boiling Point:{" "}
                      <span className="font-semibold">
                        {selectedElement?.boilingPoint} K
                      </span>{" "}
                      <br /> Bonding Type:{" "}
                      <span className="font-semibold">
                        {selectedElement?.bondingType}
                      </span>{" "}
                      <br />
                      {selectedElement?.yearDiscovered == "Ancient"
                        ? `${selectedElement?.name} is Ancient.`
                        : `${selectedElement?.name} Year of discovery: ${" "}
                    ${selectedElement?.yearDiscovered}. `}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Page;

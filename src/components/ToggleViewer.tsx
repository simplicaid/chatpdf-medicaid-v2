"use client";
import React, { useState } from "react";
import PDFViewer from "./PDFViewer";
import DocViewer from "./DocViewer"; // Assuming you have this component
import { Button } from "./ui/button";

type Props = {
  chatId: string;
  pdfUrl: string;
};

const ToggleViewer: React.FC<Props> = ({ chatId, pdfUrl }) => {
  const [isPDFViewer, setIsPDFViewer] = useState(true);

  const toggleViewer = () => setIsPDFViewer(!isPDFViewer);

  return (
    <div className="max-h-screen p-4 h-screen flex-[5] p-0 m-0">
      <Button onClick={toggleViewer}>Switch Document View</Button>
      {isPDFViewer ? <PDFViewer pdf_url={pdfUrl} /> : <DocViewer />}
    </div>
  );
};

export default ToggleViewer;

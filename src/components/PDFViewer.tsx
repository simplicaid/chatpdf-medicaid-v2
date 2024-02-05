"use client";
import React, { useEffect, useState } from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  const [pdfUrl, setPdfUrl] = useState(pdf_url);

  // Moved fetchAndUpdatePdfUrl function
  const fetchAndUpdatePdfUrl = async () => {
    try {
      const response = await fetch("http://localhost:8000/pdf_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfUrl }),
      });
      if (!response.ok) throw new Error("Failed to fetch new PDF URL");

      const responseData = await response.json();
      const newPdfUrl = responseData.pdfUrl;
      if (responseData.changed) {
        setPdfUrl(newPdfUrl);
      }
    } catch (error) {
      console.error("Error fetching new PDF URL:", error);
    }
  };

  // Use effect to fetch and update PDF URL on mount and when pdf_url prop changes
  useEffect(() => {
    const intervalId = setInterval(fetchAndUpdatePdfUrl, 2000); // Call it every 3 seconds

    return () => clearInterval(intervalId); // Clear the interval on component unmount
  }, []);

  // Encode the URL
  const encodedPDFUrl = encodeURIComponent(pdfUrl);

  return (
    <iframe
      src={`https://docs.google.com/gview?url=${encodedPDFUrl}&embedded=true`}
      className="fullSizeIframe"
      frameBorder="0"
    ></iframe>
  );
};

export default PDFViewer;

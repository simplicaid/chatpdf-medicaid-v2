"use client";
import React, { useEffect, useState, useRef } from "react";

type Props = {
  pdf_url: string;
};

const PDFViewer: React.FC<Props> = ({ pdf_url }) => {
  const [pdfUrl, setPdfUrl] = useState(pdf_url);

  useEffect(() => {
    const fetchAndUpdatePdfUrl = async () => {
      // Only fetch if the URL hasn't been updated yet
      try {
        const response = await fetch("http://localhost:8000/pdf_url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pdfUrl: pdf_url }), // Use the prop directly
        });
        if (!response.ok) throw new Error("Failed to fetch new PDF URL");

        const responseData = await response.json();
        const newPdfUrl = responseData.pdfUrl;
        setPdfUrl(newPdfUrl);
        if (responseData.changed) {
          console.log(pdfUrl);
          // Uncomment the next line to show a success message when the PDF is updated
          // toast.success("PDF Updated!");
          // hasUpdated.current = true; // Mark as updated
        }
      } catch (error) {
        console.error("Error fetching new PDF URL:", error);
      }
    };
    fetchAndUpdatePdfUrl();
  });

  return (
    <object
      data={pdfUrl}
      type="application/pdf"
      width="100%"
      height="90%"
      style={{ border: "none" }}
    >
      <p>
        Your browser does not support PDFs. Please download the PDF to view it:{" "}
        <a href={pdfUrl}>Download PDF</a>.
      </p>
    </object>
  );
};

export default PDFViewer;

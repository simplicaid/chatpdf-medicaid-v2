import React from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  // Encode the URL
  const encodedPDFUrl = encodeURIComponent(pdf_url);

  return (
    <iframe
      src={`https://docs.google.com/gview?url=${encodedPDFUrl}&embedded=true`}
      style={{ width: '100%', height: '100%', border: 'none' }}
      frameBorder="0"
    ></iframe>
  );
};

export default PDFViewer;

"use client";
import React, { useState } from "react";
import DocUpload from "./DocumentUpload";

type DocumentStatus = "not-started" | "missing" | "pending" | "complete";

interface DocumentItem {
  name: string;
  status: DocumentStatus;
}

interface DocumentProgress {
  mandatory_documents: DocumentItem[];
  optional_documents: DocumentItem[];
}

// Define the props that DocumentUploadSidebar will accept
interface DocumentUploadSidebarProps {
  docProgress: DocumentProgress;
}

const getStatusColor = (status: DocumentStatus) => {
  switch (status) {
    case "complete":
      return "bg-green-500";
    case "missing":
      return "bg-red-500";
    case "pending":
      return "bg-yellow-500";
    case "not-started":
    default:
      return "bg-gray-500";
  }
};

const DocumentUploadSidebar: React.FC<DocumentUploadSidebarProps> = ({
  docProgress,
}) => {
  return (
    <div className="w-full h-full overflow-auto p-4 text-gray-200 bg-gray-900">
      <DocUpload />
      <h1 className="mr-3 text-4xl font-semibold">Document Upload Progress</h1>

      <h2 className="mr-3 text-2xl">Mandatory Documents</h2>
      <ul>
        {docProgress.mandatory_documents.map((document) => (
          <li key={document.name} className="flex items-center gap-2">
            <span
              className={`h-4 w-4 rounded-full ${getStatusColor(
                document.status
              )}`}
            />
            {document.name}
          </li>
        ))}
      </ul>

      <h2 className="mr-3 text-2xl">Optional Documents</h2>
      <ul>
        {docProgress.optional_documents.map((document) => (
          <li key={document.name} className="flex items-center gap-2">
            <span
              className={`h-4 w-4 rounded-full ${getStatusColor(
                document.status
              )}`}
            />
            {document.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentUploadSidebar;

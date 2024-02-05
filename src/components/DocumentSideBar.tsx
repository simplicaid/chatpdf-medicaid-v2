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

export type { DocumentItem, DocumentProgress, DocumentStatus };

// Define the props that DocumentUploadSidebar will accept
interface DocumentUploadSidebarProps {
  chatId: number;
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
  chatId,
  docProgress,
}) => {
  return (
    <div className="w-full h-full overflow-auto p-6 text-gray-200 bg-gray-800 shadow-lg">
      <div className="mb-8">
        <DocUpload chatId={chatId} />
      </div>
      {/* <h1 className="mb-4 text-2xl font-bold text-center text-indigo-300">
        Document Upload Progress
      </h1> */}
      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          Mandatory Documents
        </h2>
        <ul className="pl-4">
          {docProgress.mandatory_documents.map((document) => (
            <li
              key={document.name}
              className="flex items-center gap-4 mb-2 p-2 rounded-md bg-gray-700"
            >
              <span
                className={`h-6 w-6 rounded-full ${getStatusColor(
                  document.status
                )}`}
              />
              <span className="text-sm font-medium">{document.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="mb-2 text-lg font-semibold text-blue-200">
          Optional Documents
        </h2>
        <ul className="pl-4">
          {docProgress.optional_documents.map((document) => (
            <li
              key={document.name}
              className="flex items-center gap-4 mb-2 p-2 rounded-md bg-gray-700"
            >
              <span
                className={`h-6 w-6 rounded-full ${getStatusColor(
                  document.status
                )}`}
              />
              <span className="text-sm font-medium">{document.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentUploadSidebar;

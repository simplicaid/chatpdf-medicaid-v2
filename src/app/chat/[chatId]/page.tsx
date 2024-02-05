import ChatComponent from "@/components/ChatComponent";
import DocumentUploadSidebar, {
  DocumentProgress,
  DocumentStatus,
} from "@/components/DocumentSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React, { useState } from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  let pdfUrl = currentChat?.pdfUrl || "";
  // Function to fetch newPdfUrl and update state
  const fetchAndUpdatePdfUrl = async () => {
    try {
      const response = await fetch("http://localhost:8000/pdf_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfUrl: currentChat?.pdfUrl || "",
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch new PDF URL");

      const responseData = await response.json();
      const newPdfUrl = responseData.pdfUrl;
      return newPdfUrl;
    } catch (error) {
      console.error("Error fetching new PDF URL:", error);
    }
  };
  const isPro = await checkSubscription();

  // Assuming initialPdfUrl is obtained here
  const initialPdfUrl = currentChat?.pdfUrl || "";
  const newPdfUrl = await fetchAndUpdatePdfUrl();
  pdfUrl = newPdfUrl;

  let initialDocumentStatusData: DocumentProgress = {
    mandatory_documents: [
      { name: "Proof of Identity", status: "not-started" },
      { name: "Proof of Residence", status: "not-started" },
      { name: "Proof of Income", status: "not-started" },
      // ...other documents
    ],
    optional_documents: [
      { name: "Veteran Papers", status: "not-started" },
      { name: "Daycare Receipt", status: "not-started" },
      { name: "Proof of Pregnancy", status: "not-started" },
      { name: "Family Certificate", status: "not-started" },
      { name: "Court Orders", status: "not-started" },
      { name: "Current Insurance Policy", status: "not-started" },
      { name: "Proof of Student Status", status: "not-started" },
      { name: "Previous Medical Bills", status: "not-started" },
      // ...other documents
    ],
  };
  // Function to fetch newPdfUrl and update state
  const getAndUpdateDocStatus = async () => {
    try {
      const response = await fetch("http://localhost:8000/doc_status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to get DocStatus");

      const responseData = await response.json();
      const docStatus = responseData.data;

      // Transforming docStatus to match DocumentProgress structure
      const updatedDocumentStatusData: DocumentProgress = {
        mandatory_documents: Object.entries(
          docStatus["Mandatory Documents"]
        ).map(([name, status]) => ({
          name,
          status: status as DocumentStatus,
        })),
        optional_documents: Object.entries(docStatus["Optional Documents"]).map(
          ([name, status]) => ({
            name,
            status: status as DocumentStatus,
          })
        ),
      };
      return updatedDocumentStatusData;
    } catch (error) {
      console.error("Error fetching new PDF URL:", error);
      return initialDocumentStatusData;
    }
  };
  const documentStatusData: DocumentProgress = await getAndUpdateDocStatus();

  return (
    <div className="flex max-h-screen h-screen">
      <div className="flex w-full max-h-screen h-screen">
        {/* document upload sidebar */}
        <div className="flex-[1] max-w-xs p-0 m-0">
          <DocumentUploadSidebar
            chatId={parseInt(chatId)}
            docProgress={documentStatusData}
          />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 h-screen flex-[5] p-0 m-0">
          <PDFViewer pdf_url={pdfUrl || currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200 p-0 m-0">
          <ChatComponent chatId={parseInt(chatId)} pdfUrl={pdfUrl} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

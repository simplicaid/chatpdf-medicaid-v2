import ChatComponent from "@/components/ChatComponent";
import DocumentUploadSidebar, {
  DocumentProgress,
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
      console.log(responseData);
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

  const documentStatusData: DocumentProgress = {
    mandatory_documents: [
      { name: "Proof of Identity", status: "complete" },
      { name: "Proof of Residence", status: "pending" },
      { name: "Proof of Income", status: "not-started" },
      // ...other documents
    ],
    optional_documents: [
      { name: "Veteran Papers", status: "missing" },
      { name: "Daycare Certificate", status: "complete" },
      { name: "Pregnancy Certificate", status: "missing" },
      { name: "Family Certificate", status: "not-started" },
      { name: "Court Orders", status: "not-started" },
      { name: "Current Insurance Policy", status: "not-started" },
      { name: "Proof of Student Status", status: "not-started" },
      { name: "Previous Medical Bills", status: "not-started" },
      // ...other documents
    ],
  };

  return (
    <div className="flex max-h-screen h-screen">
      <div className="flex w-full max-h-screen h-screen">
        {/* document upload sidebar */}
        <div className="flex-[1] max-w-xs">
          <DocumentUploadSidebar
            chatId={parseInt(chatId)}
            docProgress={documentStatusData}
          />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} pdfUrl={pdfUrl} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 h-screen flex-[5]">
          <PDFViewer pdf_url={pdfUrl || currentChat?.pdfUrl || ""} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

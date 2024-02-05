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
import { UpdateCommand } from "@pinecone-database/pinecone/dist/data/update";
import { eq } from "drizzle-orm";
import { url } from "inspector";
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

  return (
    <div className="flex max-h-screen h-screen">
      <div className="flex w-full max-h-screen h-screen">
        {/* document upload sidebar */}
        <div className="flex-[1] max-w-xs p-0 m-0">
          <DocumentUploadSidebar
            chatId={parseInt(chatId)}
            docProgress={initialDocumentStatusData}
          />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 h-screen flex-[5] p-0 m-0">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200 p-0 m-0">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

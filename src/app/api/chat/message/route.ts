import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST_MESSAGE(req: Request) {
    const { content, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    await db.insert(_messages).values({
      chatId,
      content: content,
      role: "user",
    });
    // Return a response to indicate success
    return NextResponse.json({ message: "Message inserted successfully" });
  }
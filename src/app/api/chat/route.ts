import { Configuration, OpenAIApi } from "openai-edge";
import { Message } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const lastSystemMessage = messages[messages.length - 2];

    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    // Get the conversation context
    const context = await getContext(lastMessage.content, fileKey);

    // Determine the bot's next message based on the context
    const botResponse = await determineBotResponse(lastSystemMessage);

    // Save the bot's message to the database
    await db.insert(_messages).values({
      chatId,
      content: botResponse,
      role: 'system',
    });

    return NextResponse.json({ message: botResponse });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

async function determineBotResponse(lastSystemMessage) {
  console.log(lastSystemMessage);
  if (lastSystemMessage.id === '0') {
    return "Response for step 0"
  }
  // Implement your logic to determine the bot's response based on the conversation context
  // For example:
  // if (context.step === 1) {
  //   return "Response for step 1...";
  // } else if (context.step === 2) {
  //   return "Response for step 2...";
  // }
  // ...
  return "Next message from the bot...";
}

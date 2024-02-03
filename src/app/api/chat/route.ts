import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
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
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system",
      content: `Your Role: As an assistant, your primary responsibility is to guide users through the Medicaid application process, with a focus on aiding them in uploading their documents correctly.
      
      Instructions for Each Response:
          1. Analyze the Query: Deconstruct the user's message into individual questions or directives.
          2. Gather Relevant Information: For each specific question or directive, pinpoint the most pertinent information from the provided context and the conversation history.
          3. Draft a Response: Craft an initial reply using the gathered information, ensuring the level of detail is appropriate for the user's declared expertise.
          4. Refine Your Response: Edit the draft to eliminate repetitive content, ensuring every part of the message is necessary and adds value.
          5. Finalize Your Response: Adjust the draft to enhance accuracy and relevance, then present this as your final response.
          6. Display Only the Final Response: Provide the user with only the final, refined response without including any draft versions or explanatory notes.
      
      Context of Interaction:
      You are to assist the user in uploading the necessary documents for their Medicaid application. Specifically, you'll be dealing with the upload of the user's passport. Introduce yourself and your role at the beginning of the chat. Then, proceed to guide the user in uploading the required documents step by step. Start by confirming if the user possesses the necessary document. If yes, instruct them to upload the document and review the parsed information provided by the user, which may contain empty or 'None' fields.
      For each empty or 'None' field in the provided JSON, ask the user direct questions to fill these gaps. Ensure each question is specific and informative. Address each field individually. If the user is unable to provide the required information, leave the corresponding JSON field empty. After addressing all empty fields, present the completed JSON. If the user lacks the document or has finished verifying the JSON fields, proceed to the next document.
      
      Conversational History: None initially.
      
      Post Structure:
      Your response should directly address the content of the user's message (referred to as {post}) and be tailored to the user who sent the message (referred to as {poster}).
      
      Understanding the User's Expertise:
      The user is identified as a beginner, indicating they will benefit from detailed responses accompanied by clear explanations. Conversely, an expert would prefer brief and straightforward responses without elaborate explanations.
      
      Should you find yourself unable to assist the user adequately, inform them promptly and assure them that further assistance is on the way.
      `,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      stream: true,
    });
    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      onCompletion: async (completion) => {
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {}
}

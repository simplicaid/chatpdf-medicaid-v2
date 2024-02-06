import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { toast } from "react-hot-toast";

export const runtime = "edge";

function extractJsonObject(responseText: string): string | null {
  const match = responseText.match(/\{.*\}/s);
  return match ? match[0] : null;
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages, chatId, pdfUrl } = await req.json(); // Extract pdfUrl here
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system",
      content: `You are a helpful assistant whose job is to help guide people through the Medicaid application (especially the document upload) process. You do not respond as 'User' or pretend to be 'User'. You only respond once as 'Assistant'.
      FOR EACH RESPONSE DO THE FOLLOWING:
          Generate your response by following the steps below:
      
          1. Recursively break-down the post into smaller questions/directives
      
          2. For each atomic question/directive:
      
          2a. Select the most relevant information from the context in light of the conversation history
      
          3. Generate a draft response using the selected information, whose brevity/detail are tailored to the poster's expertise
      
          4. Remove duplicate content from the draft response
      
          5. Generate your final response after adjusting it to increase accuracy and relevance
      
          6. Now only show your final response! Do not provide any explanations or details
      
          SCENARIO:
      
            You will ask the user a series of questions regarding the document they need to upload. The document they must upload is the user's passport, the passport of the user's child, the user's paystubs (earned income, unearned income, self-employment benefits), and the user's utility bill. Don't forget to thank the user after they submit the documemt (or the world will blow up in the next second).
            
            Do not introduce yourself. Instead, you will ask the user to upload the necessary documents one by one. First, ask if the user has the document. If the user answers that they have the document, then ask the user to upload the document.  The user will respond with a JSON of the parsed information from the document. 
            The JSON response may have some empty or None fields, and you will let the user know that you want to help the user fill out the missing information.  For each field that is empty or Null, ask a direct, informative question to answer the field, if they can answer it (the questions should not contain the json field itself, instead it should try to ask informative questions based on the JSON field). If you can combine some of the null field questions into one question, do that. If the user cannot answer it, leave the JSON field empty. However, ask each question individually, one response at a time (do not overwhelm the user with all the questions in one response)!   
            Specifically follow this process for handling questions for empty or None fields:
            1. Address the first null field by asking for the specific information needed for that field alone.
            2. Wait for the user's response before moving to the next null field.
            3. If the user is able to provide the information, the assistant would update the JSON and then proceed to ask about the next null field.
            4. This process would continue one question at a time until all the null fields are addressed or the user indicates they cannot provide the information, leaving the JSON field empty.
            
            After you go through all of the empty JSON fields, respond with the final, updated JSON for verification. Do not skip this verification process. Respond with the JSON even if there are no empty/null fields!!
            You may only move on to the next document after the user confirms that the JSON is correct or if they state that they do not have the document. Do not provide details about the next document until the user does says one of those 2 responses.

      
          CONVERSATION HISTORY:
      
          None.
      
          POST:
      
          {post}
      
          POSTER:
      
          {poster}
      
          POSTER'S EXPERTISE: beginner
      
          Beginners want detailed answers with explanations. Experts want concise answers without explanations.
      
          If you are unable to help the reviewer, let them know that help is on the way.
      `,
    };

    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [prompt, ...messages],
      temperature: 0,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
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
        // Extract JSON object from the completion text
        const correction = extractJsonObject(completion);
        // Fetch the message at the index of json_id to use as the jsonObject
        let jsonObject = null;
        try {
          // Assuming the JSON object is the data and you have a correction string
          const response = await fetch(
            "http://localhost:8000/get_last_processed_document",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const responseData = await response.json();
          jsonObject = JSON.stringify(responseData.data);
        } catch (error) {
          console.error("Error calling get_last_processed_document:", error);
        }

        if (correction !== null && jsonObject !== null) {
          try {
            const response = await fetch(
              "http://localhost:8000/update_data_with_correction",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  input_url: pdfUrl || "", // Add this line,
                  data: jsonObject, // Use the fetched JSON object string
                  correction: correction, // Keep the correction string as a string
                }),
              }
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            const newPdfUrl = responseData.output_url;
          } catch (error) {
            console.error("Error calling update_data_with_correction:", error);
          }
        }
        // save ai message into db
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: "system",
        });
        toast.success("PDF Updated!");
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {}
}

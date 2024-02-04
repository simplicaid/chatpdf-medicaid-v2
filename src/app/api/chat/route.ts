import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

function extractJsonObject(responseText: string): string | null {
  const match = responseText.match(/\{.*\}/s);
  return match ? match[0] : null;
}

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

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
      
          CONTEXT:
      
            You will ask the user a series of questions regarding the document they need to upload. The document they must upload is the user's passport, the passport of the user's child, the user's paystubs (earned income, unearned income, self-employment benefits), and the user's utility bill.
            
            You will first introduce yourself and explain your role in this chat (only greet the user once in the beginning). Then, you will ask the user to upload the necessary documents one by one. First, ask if the user has the document. If the user answers that they have the document, then ask the user to upload the document.  The user will respond with a JSON of the parsed information from the document. 
            The JSON response will have some empty or None fields. For each field that is empty or Null, ask a direct, informative question to answer the field, if they can answer it. Ask each null field question individually, one response at a time (do not overwhelm the user with all the questions)! If you can combine some of the null field questions into one question, do that. If the user cannot answer it, leave the JSON field empty.  
            Specifically follow this process for handling questions for empty or None fields:
            1. Address the first null field by asking for the specific information needed for that field alone.
            2. Wait for the user's response before moving to the next null field.
            3. If the user is able to provide the information, the assistant would update the JSON and then proceed to ask about the next null field.
            4. This process would continue one question at a time until all the null fields are addressed or the user indicates they cannot provide the information, leaving the JSON field empty.
            
            After you go through all of the empty JSON fields, respond with the final JSON field for verification.
            If the user does not have the document or if the user verifies the JSON fields, move on and ask the user to upload the next document.

      
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
        const jsonObject = `{
          "Legal First Name": "Debra",
          "Middle Initial": "Ann",
          "Legal Last Name": "Koye",
          "Home Address is Homeless": null,
          "Home Address  Street": null,
          "Home Address  Apt": null,
          "Home Address  City": null,
          "Home Address  State": null,
          "Home Address  Zipcode": null,
          "Home Address  County": null,
          "Full Legal Name": "Debra Ann Koye",
          "Full Birth Name": "Debra Ann Koye",
          "Sex is Male": "No",
          "Sex is Female": "Yes",
          "Sex is X": "No",
          "Gender Identity is Male": "No",
          "Gender Identity is Female": "Yes",
          "Gender Identity isn Binaryorn Conforming": null,
          "Gender Identity is X": null,
          "Gender Identity is Transgender": null,
          "Gender Identity  Different Identity  Is Different Identity": null,
          "Gender Identity  Different Identity  Describe Identity": null,
          "Date Of Birth  M M": "4",
          "Date Of Birth  D D": "21",
          "Date Of Birth  Y Y Y Y": "1988",
          "City Of Birth": null,
          "State Of Birth": "California",
          "Country Of Birth": "U.S.A.",
          "is Applying For Health Insurance ": "No",
          "Immigration Status is U S Citizen": "Yes"
      }`;
        if (correction !== null) {
          console.log("Extracted JSON Object:", correction);
          try {
            // Assuming the JSON object is the data and you have a correction string
            const response = await fetch('http://localhost:8000/update_data_with_correction', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: jsonObject, // Keep the JSON object string as a string
                correction: correction, // Keep the correction string as a string
              }),
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json();
            console.log("Update Data With Correction Response:", responseData);
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
      },
    });
    return new StreamingTextResponse(stream);
  } catch (error) {}
}
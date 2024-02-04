"use client";
import React from "react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import IntakeQuestionnaire from "./IntakeQuestionnaire";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  // TODO: for testing, set questionnaire state to true; later set to false
  const [isQuestionnaireCompleted, setIsQuestionnaireCompleted] = React.useState(true);
  const [question, setQuestion] = React.useState(0);
  const [verify, setVerify] =  React.useState(false);

  const increment = () => {
    setQuestion(question + 1);
  };

  const decrement = () => {
    setQuestion(question - 1);
  };
  
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const initialAgentMessage: Message = {
    id: '0',
    content: `Hello! I am Simplicaid, and I'm here to guide you through the Medicaid application process.
    We'll go through a series of questions to ensure we gather all the necessary information for your application,
    and I'll try my best to fill out the Medicaid form for you. Please answer them to the best of your ability. Let's get started!`,
    role: 'system',
  };

  // TODO: write to db so we can maintain messagse
  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: [initialAgentMessage],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

    // Render IntakeQuestionnaire
    if (!isQuestionnaireCompleted) {
      return (
        <IntakeQuestionnaire
          onComplete={() => setIsQuestionnaireCompleted(true)}
        />
      );
    }  
  
  // Render chatbot
  return (
    <div className="flex flex-col h-screen">
      {/* header */}
      <div className="p-2 bg-white">
        <h3 className="text-2xl font-bold pt-4 pl-4">Chat</h3>
      </div>

      {/* message list */}
      <div className="flex-grow overflow-auto pl-3" id="message-container"> 
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* input form */}
      <form
        onSubmit={handleSubmit}
        className="flex-none px-2 py-4 bg-white"
      >
        <div className="flex pl-3 pb-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Enter..."
            className="w-full"
          />
          <Button type="submit" className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;

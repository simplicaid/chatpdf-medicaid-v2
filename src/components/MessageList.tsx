import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2 } from "lucide-react";
import React from "react";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!messages) return <></>;
  return (
    <div className="flex flex-col gap-2.5 px-4">
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            key={message.id}
            className={cn({
              "flex justify-end items-start gap-2.5": isUser,
              "flex justify-start items-start gap-2.5": !isUser,
            })}
          >
            {/* Message bubble */}
            <div
              className={cn(
                "flex flex-col max-w-[280px] leading-1.5 border-gray-200 shadow-md",
                {
                  "bg-blue-600 text-white rounded-xl p-2.5": isUser,
                  "bg-gray-100 text-gray-900 rounded-xl p-3.5": !isUser, 
                }
              )}
            >
              {/* Sender label */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className={cn("text-sm font-semibold", {
                  "text-white": isUser,
                  "text-gray-900 dark:text-white": !isUser,
                })}>
                  {isUser ? "" : "Simplicaid:"}
                </span>
              </div>
              {/* Message content */}
              {/* <p className="text-sm font-normal py-2.5">{message.content}</p> */}
              <p className={cn("text-sm font-normal", {
                "text-center": isUser, // Align right for user messages
                "text-left py-2.5": !isUser, // Align left for assistant messages
              })}>
                {message.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

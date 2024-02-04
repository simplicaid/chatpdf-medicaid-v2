import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadToS3, getS3Url } from "@/lib/s3";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

type Props = { chatId: number };

async function postMessage(chatId:number, content: string) {
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chatId: chatId, content: content }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log(result.message);
}

function getFileNameWithoutExtension(fileName: string) {
  // Check if fileName is valid
  if (!fileName) return '';

  // Find the last occurrence of '.'
  const lastDotIndex = fileName.lastIndexOf('.');

  // If there's no '.', return the full fileName
  if (lastDotIndex === -1) return fileName;

  // Return the substring from the beginning to the last '.'
  return fileName.substring(0, lastDotIndex);
}

const DocUpload = ({ chatId }: Props) => {
  const [uploading, setUploading] = React.useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
    }, // Adjust accepted file types as needed
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // File size limit
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }
        const fileUrl = getS3Url(data.file_key);
        console.log(`File URL: ${fileUrl}`);
        console.log(`File Name: ${data.file_name}`);
        const document_type = getFileNameWithoutExtension(data.file_name)
        toast.success("File uploaded successfully");

        // Make API call to parse_document
        const response = await fetch("http://localhost:8000/parse_document", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doc_type: document_type,
            s3_url: fileUrl,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Document parsed successfully:", result);
        toast.success("Document parsed successfully");
        
        // Post the JSON output as user to the chatbot
        postMessage(chatId, result.data)

        // TODO:
        // switch (document_type) {
        //   case 'self_passport':
        //     documentStatusData['Proof of Identity'] = 'pending';
        //     break;
        //   case 'child_passport':
        //     documentStatusData['Family Certificate'] = 'pending';
        //     break;
        //   case 'paycheck_1':
        //   case 'paycheck_2':
        //     documentStatusData['Proof of Income'] = 'pending';
        //     break;
        //   default:
        //     // Handle other document types or errors
        //     break;
        // }

      } catch (error) {
        console.error("Error parsing document:", error);
        toast.error("Error parsing document");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Uploading...</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-400">Drop files here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DocUpload;

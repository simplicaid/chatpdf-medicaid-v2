import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadToS3, getS3Url } from "@/lib/s3";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

const DocUpload = () => {
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
      if (file.size > 10 * 1024 * 1024) { // File size limit
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
        // Use getS3Url to get the file URL
        const fileUrl = getS3Url(data.file_key);
        console.log(`File URL: ${fileUrl}`);
        console.log(`File Name: ${data.file_name}`);
        toast.success("File uploaded successfully");

        // Make API call to parse_document
        const response = await fetch('http://localhost:8000/parse_document', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              doc_type: "passport", // Set this accordingly if you have the document type
              s3_url: fileUrl,
          }),
          });
  
          if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
            }

      } catch (error) {
        console.error(error);
        toast.error("Upload failed");
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
"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import JSONPretty from "react-json-pretty"; // Assuming you have this package installed

const DocViewer = () => {
  const [docUrl, setDocUrl] = useState("");
  const [jsonObj, setJsonObj] = useState(null);

  useEffect(() => {
    const fetchAndUpdateDocUrl = async () => {
      try {
        const response = await fetch("http://localhost:8000/doc_url", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch Document URL");

        const responseData = await response.json();
        const newDocUrl = responseData.docUrl;
        setDocUrl(newDocUrl);
        if (responseData.changed) {
        }
      } catch (error) {
        console.error("Error fetching new Document URL:", error);
      }
    };

    const fetchAndUpdateJson = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/get_updated_processed_document",
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
        setJsonObj(responseData.data); // Store the JSON object directly
      } catch (error) {
        console.error("Error calling get_updated_processed_document:", error);
      }
    };

    const intervalIdDocUrl = setInterval(fetchAndUpdateDocUrl, 3000); // Call it every 5 seconds
    const intervalIdJson = setInterval(fetchAndUpdateJson, 3000);
    return () => {
      clearInterval(intervalIdDocUrl); // Clear the first interval on component unmount
      clearInterval(intervalIdJson); // Clear the second interval on component unmount
    };
  }, [docUrl, jsonObj]);

  // Check if the URL is an image and create an <img> tag instead of an <iframe> for images
  const isImageUrl = /\.(jpeg|jpg|gif|png)$/.test(docUrl);

  // Function to render JSON object in a human readable way
  const renderHumanReadableJson = (jsonObj: any) => {
    if (!jsonObj) return <p className="text-gray-500">Loading..</p>;

    const addSpacesToCamelCase = (text: string) => {
      return text.replace(/([A-Z])/g, " $1").trim();
    };

    const removeSectionText = (text: string) => {
      return text.replace(/Section [A-Z]/g, "").trim();
    };

    const renderValue = (value: any) => {
      if (value === null) {
        return <span className="text-red-600">null</span>;
      }
      return (
        <span className="text-green-600">{`${value}`.replace(/_/g, " ")}</span>
      );
    };

    return (
      <div className="p-4 bg-gray-100 rounded-lg shadow">
        <h2 className="mb-2 text-xl font-semibold text-gray-700">
          Parsed Information
        </h2>
        {Object.entries(jsonObj).map(([key, value]) => (
          <p key={key} className="text-gray-600">
            <strong className="font-medium text-gray-800">
              {removeSectionText(addSpacesToCamelCase(key.replace(/_/g, " ")))}:
            </strong>{" "}
            {renderValue(value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div>
      {isImageUrl ? (
        <img
          src={docUrl}
          className="fullSizeIframe"
          alt="Document"
          style={{ maxHeight: "50vh", objectFit: "contain" }} // Adjusted style to maintain aspect ratio
        />
      ) : (
        <object
          data={docUrl}
          type="application/pdf"
          className="fullSizeIframe"
          aria-label="Document Viewer"
          style={{ maxHeight: "50vh" }}
        ></object>
      )}
      <div
        className="w-full mt-4"
        style={{ maxHeight: "42vh", overflowY: "auto" }}
      >
        {renderHumanReadableJson(jsonObj)}
      </div>
    </div>
  );
};

export default DocViewer;

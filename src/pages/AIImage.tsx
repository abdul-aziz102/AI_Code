import React, { useState } from "react";
import axios from "axios";

const AIImage = () => {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateImage = async () => {
    setIsLoading(true);
    setError("");
    setImageUrl("");

    try {
      const response = await axios.post(
        "https://api-inference.huggingface.co/models/prompthero/openjourney", // Free model
        { inputs: input },
        {
          headers: {
            Authorization: 'Bearer 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',
          },
          responseType: "blob",
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      setImageUrl(blobUrl);
    } catch (err) {
      setError("Model is loading... please wait 30 seconds and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="A futuristic city at sunset"
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button
          onClick={generateImage}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p>Loading... (May take 30+ seconds for first request)</p>}
      {imageUrl && (
        <div className="mt-4">
          <img src={imageUrl} alt="Generated" className="max-w-full rounded" />
        </div>
      )}
    </div>
  );
};

export default AIImage;
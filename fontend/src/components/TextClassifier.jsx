import React, { useState, useEffect } from "react";
import axios from "axios";

const TextClassifier = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Debounce typing
  useEffect(() => {
    if (!text.trim()) return;
    const timeout = setTimeout(() => handleClassify(), 800);
    return () => clearTimeout(timeout);
  }, [text]);

  const handleClassify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/classify/`, { text });
      setResult(res.data);
    } catch (err) {
      setResult({ error: "Failed to classify text" });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSample = async (category) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/sample/${category}/`);
      setText(res.data.sample);
    } catch (err) {
      console.error("Error fetching sample:", err);
    }
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  const charCount = text.length;
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 p-6">
      <h1 className="text-3xl font-bold text-sky-600 mb-6 text-center">Text Classifier</h1>

      <textarea
        className="w-full p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
        rows="6"
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex space-x-2 mb-4 flex-wrap">
        <button 
          onClick={handleClassify} 
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition"
        >
          Classify
        </button>
        <button 
          onClick={handleClear} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Clear
        </button>
        {["business", "health", "politics"].map((cat) => (
          <button
            key={cat}
            onClick={() => handleFetchSample(cat)}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)} Sample
          </button>
        ))}
      </div>

      <p className="text-gray-500 mb-2">Characters: {charCount} | Words: {wordCount}</p>

      {loading && <p className="text-sky-500 animate-pulse">Classifying...</p>}

      {result && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <>
              <p className="text-lg font-semibold mb-2">
                Predicted Class:{" "}
                <span className="text-sky-600">{result.prediction}</span>
              </p>
              <p className="font-semibold mb-2">Probabilities:</p>
              <ul className="space-y-2">
                {Object.entries(result.probabilities).map(([cls, prob]) => (
                  <li key={cls} className="flex items-center space-x-2">
                    <span className="w-24">{cls}</span>
                    <div className="flex-1 bg-gray-200 rounded h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded ${
                          cls === result.prediction ? "bg-sky-500" : "bg-gray-400"
                        } transition-all duration-500`}
                        style={{ width: `${prob * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right">{(prob * 100).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TextClassifier;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagic, faBroom, faBriefcaseMedical, faHeartbeat, faLandmark } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import Footer from "./Footer";

const TextClassifier = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

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
    <div className="flex flex-col min-h-screen bg-gray-800 text-sky-400">
      <Navbar />
      <main className="flex-grow p-6 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-sky-300 mb-6 text-center">Text Classifier</h1>

        <textarea
          className="w-full p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sky-500"
          rows="6"
          placeholder="Enter text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex space-x-2 mb-4 flex-wrap">
          <button 
            onClick={handleClassify} 
            className="flex items-center bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition"
          >
            <FontAwesomeIcon icon={faMagic} className="mr-2" /> Classify
          </button>
          <button 
            onClick={handleClear} 
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            <FontAwesomeIcon icon={faBroom} className="mr-2" /> Clear
          </button>
          <button
            onClick={() => handleFetchSample("business")}
            className="flex items-center bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition text-gray-800"
          >
            <FontAwesomeIcon icon={faBriefcaseMedical} className="mr-2" /> Business
          </button>
          <button
            onClick={() => handleFetchSample("health")}
            className="flex items-center bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition text-gray-800"
          >
            <FontAwesomeIcon icon={faHeartbeat} className="mr-2" /> Health
          </button>
          <button
            onClick={() => handleFetchSample("politics")}
            className="flex items-center bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition text-gray-800"
          >
            <FontAwesomeIcon icon={faLandmark} className="mr-2" /> Politics
          </button>
        </div>

        <p className="text-gray-400 mb-2">Characters: {charCount} | Words: {wordCount}</p>

        {loading && <p className="text-sky-400 animate-pulse">Classifying...</p>}

        {result && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-900 shadow">
            {result.error ? (
              <p className="text-red-400">{result.error}</p>
            ) : (
              <>
                <p className="text-lg font-semibold mb-2">
                  Predicted Class:{" "}
                  <span className="text-sky-400">{result.prediction}</span>
                </p>
                <p className="font-semibold mb-2">Probabilities:</p>
                <ul className="space-y-2">
                  {Object.entries(result.probabilities).map(([cls, prob]) => (
                    <li key={cls} className="flex items-center space-x-2">
                      <span className="w-24">{cls}</span>
                      <div className="flex-1 bg-gray-700 rounded h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded ${
                            cls === result.prediction ? "bg-sky-500" : "bg-gray-500"
                          } transition-all duration-500 ease-in-out`}
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
      </main>
      <Footer />
    </div>
  );
};

export default TextClassifier;

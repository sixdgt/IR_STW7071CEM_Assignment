import React, { useState } from "react";
import ResultsPage from "./ResultsPage";
import axios from "axios";

const SearchPublications = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const handleSearch = async (e, newPage = 1) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/search/?query=${encodeURIComponent(query)}&page=${newPage}`
      );

      setResults(response.data.results);
      setPage(response.data.page);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      setError("Failed to fetch results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setIsSearching(false);
    setQuery("");
    setResults([]);
    setError(null);
    setPage(1);
    setTotalPages(1);
  };

  return (
    <>
      <ResultsPage
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        results={results}
        error={error}
        loading={loading}
        onBackToHome={handleBackToHome}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </>
  );
};

export default SearchPublications;

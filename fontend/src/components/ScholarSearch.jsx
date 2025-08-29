import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import ResultsPage from './ResultsPage';
import Footer from './Footer';
import axios from 'axios';

const ScholarSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      setError('Failed to fetch results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setIsSearching(false);
    setQuery('');
    setResults([]);
    setError(null);
    setPage(1);
    setTotalPages(1);
  };

  return isSearching ? (
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
  ) : (
    <LandingPage query={query} setQuery={setQuery} onSearch={handleSearch} />
  );
};

const LandingPage = ({ query, setQuery, onSearch }) => (
  <div className="flex flex-col min-h-screen bg-white text-gray-800">
    <header className="flex justify-end items-center p-4 text-sm text-gray-600">
      <nav className="flex items-center space-x-4">
        <a href="#" className="hover:underline">Sign in</a>
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      </nav>
    </header>

    <main className="flex-grow flex flex-col justify-center items-center p-8">
      <h1 className="text-4xl font-light text-sky-600 mb-8">
        <img src="/culogo.png" alt="Coventry University Logo" className="inline-block h-10 mr-2" />
        <span className="font-bold">IR</span> Search Engine
      </h1>

      <form onSubmit={onSearch} className="flex w-full max-w-2xl shadow-md rounded-full overflow-hidden">
        <input
          type="text"
          className="flex-grow p-3 pl-5 text-lg focus:outline-none focus:border-sky-500"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="p-3 bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>
    </main>

    <Footer />
  </div>
);

export default ScholarSearch;

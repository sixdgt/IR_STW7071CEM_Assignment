import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronLeft,
  faChevronRight,
  faUser,
  faCalendarAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import Footer from "./Footer";

const highlightText = (text, query) => {
  if (!query) return text;
  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery.split(" ").join("|")})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300 text-gray-900 rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const ResultsPage = ({
  query,
  setQuery,
  onSearch,
  results,
  error,
  loading,
  totalPages,
  page,
}) => {
  const handlePrev = () => {
    if (page > 1) onSearch(null, page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onSearch(null, page + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-sky-400">
      <Navbar />

      {/* Search Bar */}
      <div className="p-6 max-w-4xl mx-auto w-full">
        <form
          onSubmit={(e) => onSearch(e, 1)}
          className="flex w-full shadow-md rounded-full overflow-hidden bg-gray-900"
        >
          <input
            type="text"
            className="flex-grow p-3 pl-5 text-lg text-sky-500 focus:outline-none"
            placeholder="Search publications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="p-3 bg-sky-500 text-white hover:bg-sky-600 transition flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </form>
      </div>

      {/* Main */}
      <main className="flex-grow p-6 max-w-5xl mx-auto w-full">
        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        {loading &&
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-700 p-5 rounded-lg shadow animate-pulse mb-6"
            >
              <div className="h-6 bg-gray-500 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-500 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-500 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-500 rounded w-5/6"></div>
            </div>
          ))}

        {!loading && results.length > 0 && (
          <>
            <div className="space-y-6">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-gray-900 p-5 rounded-lg shadow hover:shadow-lg transition transform hover:scale-[1.02]"
                >
                  {/* Title */}
                  <h2 className="text-xl text-sky-400 font-semibold mb-2">
                    {highlightText(result.title, query)}
                  </h2>

                  {/* Authors */}
                  {result.authors?.length > 0 && (
                    <span className="text-gray-300 mb-2 items-center space-x-1">
                      <FontAwesomeIcon icon={faUser} className="text-sky-500" />
                      <span>
                        {result.authors.map((author, i) => (
                          <span key={i}>
                            {author.profile ? (
                              <a
                                href={author.profile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-400"
                              >
                                {author.name}
                              </a>
                            ) : (
                              <span>{author.name}</span>
                            )}
                            {i < result.authors.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    </span>
                  )}

                  {/* Published Date */}
                  {result.year && (
                    <span className="text-gray-400 mb-2 items-center space-x-1">
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-sky-500"
                      />
                      <span>{result.year}</span>
                    </span>
                  )}

                  {/* Abstract Snippet */}
                  {result.snippet && (
                    <p className="text-gray-400 mb-3">
                      {highlightText(result.snippet, query)}
                    </p>
                  )}

                  {/* Score */}
                  {result.score !== undefined && (
                    <div className="flex items-center space-x-2 text-sm mb-2">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-yellow-400"
                      />
                      <span className="text-gray-300">
                        Relevance Score:{" "}
                        <span className="font-semibold text-yellow-300">
                          {result.score.toFixed(2)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Link */}
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 mt-2 inline-block"
                  >
                    View Paper →
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2 text-sm">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-sky-400 hover:bg-gray-600 disabled:opacity-50 transition"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-sky-400 hover:bg-gray-600 disabled:opacity-50 transition"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </>
        )}

        {!loading && results.length === 0 && !error && (
          <p className="text-gray-400 text-center mt-10">No results found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ResultsPage;

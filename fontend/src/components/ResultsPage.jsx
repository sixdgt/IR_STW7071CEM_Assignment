import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const highlightText = (text, query) => {
  if (!query) return text;
  const escapedQuery = query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery.split(" ").join("|")})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 rounded">{part}</mark> : part
  );
};

const ResultsPage = ({
  query,
  setQuery,
  onSearch,
  results,
  error,
  loading,
  onBackToHome,
  totalPages,
  page,
}) => {

  const handlePrev = () => {
    if (page > 1) onSearch(null, page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onSearch(null, page + 1);
  };

  const renderPagination = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex justify-center items-center mt-8 space-x-1 text-sm">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-2 py-1 text-gray-500">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => onSearch(null, p)}
              className={`px-3 py-1 rounded border border-gray-300 transition ${
                p === page
                  ? "bg-sky-500 text-white hover:bg-sky-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 transition"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="flex flex-col items-center p-4 bg-white shadow-sm">
        <h1 className="text-4xl font-light text-sky-600 flex items-center mb-4">
          <img src="/culogo.png" alt="Coventry University Logo" className="h-10 mr-2 cursor-pointer" onClick={onBackToHome} />
          <span className="font-bold">IR</span> Search Engine
        </h1>

        {/* Search Bar */}
        <form onSubmit={onSearch} className="flex w-full max-w-2xl shadow-md rounded-full overflow-hidden">
          <input
            type="text"
            className="flex-grow p-3 pl-5 text-lg focus:outline-none"
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
      </header>

      {/* Main */}
      <main className="flex-grow p-8 max-w-5xl mx-auto w-full">
        {/* Error */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Loading Skeleton */}
        {loading && Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg shadow animate-pulse mb-6">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        ))}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="space-y-6">
              {results.map((result, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <h2 className="text-xl text-sky-700 font-semibold mb-1">
                    {highlightText(result.title, query)}
                  </h2>

                  <p className="text-gray-600 mb-2">
                    {result.authors?.map((author, i) => (
                      <span key={i}>
                        {author.profile ? (
                          <a href={author.profile} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                            {author.name}
                          </a>
                        ) : (
                          <span>{author.name}</span>
                        )}
                        {i < result.authors.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>

                  {result.snippet && <p className="text-gray-500 mb-2">{highlightText(result.snippet, query)}</p>}

                  {result.score !== undefined && <p className="text-sm text-gray-400">Score: {result.score.toFixed(2)}</p>}

                  <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline mt-2 inline-block">
                    View Paper
                  </a>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && renderPagination()}
          </>
        )}

        {!loading && results.length === 0 && !error && (
          <p className="text-gray-500 text-center mt-10">No results found.</p>
        )}
      </main>
    </div>
  );
};

export default ResultsPage;

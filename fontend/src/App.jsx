import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScholarSearch from "./components/ScholarSearch";
import SearchPublications from "./components/SearchPublications"; // move your existing search+results here
import ClassifierPage from "./components/TextClassifier"; // new page


function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page with two cards */}
        <Route path="/" element={<ScholarSearch />} />

        {/* Search Publications */}
        <Route path="/search" element={<SearchPublications />} />

        {/* Classifier */}
        <Route path="/classify" element={<ClassifierPage />} />
      </Routes>
    </Router>
  );
}

export default App;

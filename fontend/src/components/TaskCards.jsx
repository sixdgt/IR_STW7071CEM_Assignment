import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTasks } from "@fortawesome/free-solid-svg-icons";

function TaskCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Link to="/search" className="bg-gray-900 shadow-lg rounded-2xl p-8 flex flex-col justify-between transform transition duration-300 hover:scale-101 hover:shadow-sky-500/20">
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-sky-500">
            <FontAwesomeIcon icon={faSearch} /> Task 1 - Search Publications
          </h2>
          <p className="text-gray-300 mb-4">
            Find research publications from Coventry University's School of Economics, Finance, and Accounting.
          </p>
        </div>
        <div className="mt-4 px-4 py-2 border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-gray-900 font-medium rounded-lg transition text-center">
          Go to Search
        </div>
      </Link>

      <Link to="/classify" className="bg-gray-900 shadow-lg rounded-2xl p-8 flex flex-col justify-between transform transition duration-300 hover:scale-101 hover:shadow-sky-500/20">
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-sky-500">
            <FontAwesomeIcon icon={faTasks} /> Task 2 - Classification
          </h2>
          <p className="text-gray-300 mb-4">
            Classify publications into relevant categories using the classification form.
          </p>
        </div>
        <div className="mt-4 px-4 py-2 border-2 border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-gray-900 font-medium rounded-lg transition text-center">
          Go to Classifier
        </div>
      </Link>
    </div>
  );
}

export default TaskCards;

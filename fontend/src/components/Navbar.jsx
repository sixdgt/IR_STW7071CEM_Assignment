import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch, faBrain } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home", icon: faHome },
    { to: "/search", label: "Search", icon: faSearch },
    { to: "/classify", label: "Classifier", icon: faBrain },
  ];

  return (
    <nav className="bg-gray-900 text-sky-400 px-6 py-3 shadow-lg flex justify-between items-center">
      <div className="flex items-center">
        <img src="/culogo.png" alt="CU" className="h-8 mr-2" />
        <span className="font-bold text-xl">| Softwarica</span>
      </div>
      <div className="flex space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
              location.pathname === item.to
                ? "bg-sky-600 text-white"
                : "hover:bg-gray-800 hover:text-sky-300"
            }`}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;

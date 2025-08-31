import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSchool, faUniversity, faGlobe } from "@fortawesome/free-solid-svg-icons";

function Footer(){
    const currentYear = new Date().getFullYear();
    return (
        <footer className="py-4 text-center text-sm text-sky-500 bg-gray-900 shadow-lg">
            <nav className="flex justify-center space-x-4">
                <span className="font-bold">&copy; {currentYear} Sandesh Tamang | </span>
                <a href="https://softwarica.edu.np/" target='_blank' className="cursor-pointer">
                <FontAwesomeIcon icon={faSchool} className="text-blue-500" /> Softwarica College</a>
                <a href="https://www.coventry.ac.uk/" target='_blank' className="cursor-pointer">
                <FontAwesomeIcon icon={faUniversity} className="text-green-500" /> Coventry University</a>
                <a href="https://pureportal.coventry.ac.uk/" target='_blank' className="cursor-pointer">
                <FontAwesomeIcon icon={faGlobe} className="text-yellow-500" /> Coventry Pureportal</a>
            </nav>
        </footer>
    );
}

export default Footer;
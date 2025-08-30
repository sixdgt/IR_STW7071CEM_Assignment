import React from "react";
import TaskCards from "./TaskCards";
import Footer from "./Footer";

const ScholarSearch = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-800 text-sky-400">
      <main className="flex-grow flex flex-col justify-center items-center p-8">
        <h1 className="text-4xl font-light text-sky-600 mb-2">
          <img src="/culogo.png" alt="Coventry University Logo" className="inline-block h-10 mr-2" /> | 
          <span className="font-bold"> Sandesh</span> Tamang
        </h1>
        <h1 className="text-3xl font-light text-sky-600 mb-2">
          Assignment of Information Retrieval | <span className="font-bold">STW7071CEM</span>
        </h1>
        <h4 className="text-xl">
          <span className="font-bold">STUDENT ID: </span> 150114 
          <span className="font-bold"> | CUID: </span> 16544174
        </h4>
        <TaskCards />
      </main>
      <Footer />
    </div>
  );
};

export default ScholarSearch;

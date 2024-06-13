import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import ArticlePage from "./components/feed/ArticlePage";


const App = () => {
  const [apiData, setApiData] = useState([]);

  window.apiIP = "http://localhost:8000";

  return (

    <Router>
      <Routes>
        <Route path="*" element={<div>Not Found</div>} />
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={<Home onDataFetch={setApiData} userData={apiData} />}
        />
        <Route path="/article/:id" element={<ArticlePage />} />
      </Routes>
    </Router>
  );
};

export default App;

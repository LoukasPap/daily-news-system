import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ProtectedPage from "./components/Protected";
import Home from "./components/Home";

import { Box, Button, Spinner } from "@chakra-ui/react";

// import AuthProvider from "./components/AuthProvider";

// import Routes from "./routes/index";

const App = () => {
  const [apiData, setApiData] = useState([]);
  const [token, setToken] = useState([]);

  window.apiIP = "http://localhost:8002";

  return (
    // <AuthProvider>
    //   <Routes />
    // </AuthProvider>

    <Router>
      <Routes>
        <Route path="*" element={<div>Not Found</div>} />
        <Route path="/" element={<Login />} />
        <Route path="/protected" element={<ProtectedPage />} />
        <Route
          path="/home"
          element={<Home onDataFetch={setApiData} userData={apiData} />}
        />
      </Routes>
    </Router>
  );
};

export default App;

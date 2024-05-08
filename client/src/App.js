import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProtectedPage from './components/Protected';


function App() {

  window.myGlobalVariable = "http://localhost:8000"


  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/protected' element={<ProtectedPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;

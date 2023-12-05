import logo from "./logo.svg";
import "./App.css";
import Login from "./components/login/login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Signup from "./components/signup/signup";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

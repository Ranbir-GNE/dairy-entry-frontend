import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginRegister from "./Components/LoginRegister";
import { Toaster } from "sonner";
import Error from "./Components/Error";
import authContext from "./Context/authContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import { useState } from "react";
import DiaryApp from "./Components/DiaryApp";

function App() {
  const [auth, setAuth] = useState(false);
  return (
    <>
      <authContext.Provider value={{ auth, setAuth }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginRegister />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<DiaryApp />} />
            </Route>
            <Route path="*" element={<Error />} />
          </Routes>
          <Toaster
            {...{
              position: "top-right",
              duration: 5000,
            }}
          />
        </BrowserRouter>
      </authContext.Provider>
    </>
  );
}

export default App;

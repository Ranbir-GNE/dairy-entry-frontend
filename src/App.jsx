import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Toaster } from "sonner";
import authContext from "./Context/authContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import { useState, lazy, Suspense } from "react";
import Error from "./Components/Error";

const LoginRegister = lazy(() => import("./Components/LoginRegister"));
const DiaryApp = lazy(() => import("./Components/DiaryApp"));
const Upload = lazy(() => import("./Components/Upload"));

function App() {
  const [auth, setAuth] = useState(false);
  return (
    <>
      <authContext.Provider value={{ auth, setAuth }}>
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<LoginRegister />} />
              <Route path="/upload" element={<Upload />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<DiaryApp />} />
              </Route>
              <Route path="*" element={<Error />} />
            </Routes>
          </Suspense>
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

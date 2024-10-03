import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import authContext from "../Context/authContext";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const authData = useContext(authContext);

  useEffect(() => {
    const token = localStorage.getItem("key");
    if (!token) {
      navigate("/");
    }
  }, []);

  return <>{authData.auth ? <Outlet /> : localStorage.setItem("key", "")}</>;
};

export default ProtectedRoute;

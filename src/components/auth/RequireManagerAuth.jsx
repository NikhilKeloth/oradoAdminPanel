import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const RequireManagerAuth = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("managerToken");

  if (!token) {
    return <Navigate to="/manger/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireManagerAuth;



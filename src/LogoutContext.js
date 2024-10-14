import React, { createContext, useState } from "react";

export const LogoutContext = createContext();

export const LogoutProvider = ({ children }) => {
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  return (
    <LogoutContext.Provider value={{ logoutInProgress, setLogoutInProgress }}>
      {children}
    </LogoutContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from "react";
import { auth, getUserRoleFirestore } from "./firebase";

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userRole = await getUserRoleFirestore(user.uid);
          setRole(userRole);
        } catch (error) {
          console.error("Error fetching user role:", error.message);
        }
      } else {
        setRole(null); // Reset role to null on logout
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};

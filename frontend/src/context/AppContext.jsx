import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appName] = useState('Blog Platform');

  return (
    <AppContext.Provider value={{ appName }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

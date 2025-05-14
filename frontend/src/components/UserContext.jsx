// UserContext.jsx
import { createContext, useContext } from 'react';

export const UserContext = createContext({
  userType: 0, // Default to NEW_USER
  walletAddress: null,
  updateWalletState: () => {}
});

export const useUser = () => useContext(UserContext);
import { create } from 'zustand';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';

export const useUserStore = create((set) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}));

export function decrypt() {
  const userCrypt = Cookies.get('user');

  if (userCrypt) {
    const bytes = CryptoJS.AES.decrypt(userCrypt, process.env.NEXT_PUBLIC_SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } else {
    return null;
  }
}

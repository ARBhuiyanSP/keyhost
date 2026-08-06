import { create } from 'zustand';
import axios from 'axios';

const useConnectionStore = create((set) => ({
  isServerUnreachable: false,
  setServerUnreachable: (unreachable) => set({ isServerUnreachable: unreachable }),
  
  checkConnection: async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await axios.get(`${apiUrl}/settings/public`, { timeout: 5000 });
      set({ isServerUnreachable: false });
      return true;
    } catch (err) {
      set({ isServerUnreachable: true });
      return false;
    }
  }
}));

export default useConnectionStore;

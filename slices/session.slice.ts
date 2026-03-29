import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearAuthFromStorage, setAuthInStorage } from "@/lib/auth-storage";
import { setEventContextStorage } from "@/lib/event-context";

type SessionState = {
  token: string | null;
  domain: "organization" | "guest" | null;
  eventContextCode: string | null;
};

const initialState: SessionState = { token: null, domain: null, eventContextCode: null };

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ token: string; domain: "organization" | "guest" }>) {
      state.token = action.payload.token;
      state.domain = action.payload.domain;
      setAuthInStorage(action.payload.token, action.payload.domain);
    },
    restoreSession(state, action: PayloadAction<{ token: string; domain: "organization" | "guest" }>) {
      state.token = action.payload.token;
      state.domain = action.payload.domain;
    },
    clearSession(state) {
      state.token = null;
      state.domain = null;
      clearAuthFromStorage();
    },
    setEventContext(state, action: PayloadAction<string | null>) {
      state.eventContextCode = action.payload;
      setEventContextStorage(action.payload);
    },
  },
});

export const { setSession, restoreSession, clearSession, setEventContext } = sessionSlice.actions;
export default sessionSlice.reducer;

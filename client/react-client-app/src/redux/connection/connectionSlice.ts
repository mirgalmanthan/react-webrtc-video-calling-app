import { createSlice } from "@reduxjs/toolkit";

export interface ConnectionState {
  value: boolean;
}

const initialState: ConnectionState = {
  value: false,
};


export const connectionSlice = createSlice({
  initialState,
  name: "connection",
  reducers: {
    connect: (state) => {
      state.value = true;
    },
    disconnect: (state) => {
      state.value = false;
    },
  },
});

export const { connect, disconnect } = connectionSlice.actions;
export default connectionSlice.reducer;

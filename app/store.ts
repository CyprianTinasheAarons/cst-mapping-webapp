import { configureStore } from "@reduxjs/toolkit";
import haloReducer from "../slices/halo/haloSlice";
import ingramReducer from "../slices/ingram/ingramSlice";
import bitdefenderReducer from "../slices/bitdefender/bitdefenderSlice";
import sentinelOneReducer from "../slices/sentinelOne/sentinelOneSlice";
import duoReducer from "../slices/duo/duoSlice";
import gammaReducer from "../slices/gamma/gammaSlice";

export const store = configureStore({
  reducer: {
    halo: haloReducer,
    ingram: ingramReducer,
    bitdefender: bitdefenderReducer,
    sentinelOne: sentinelOneReducer,
    duo: duoReducer,
    gamma: gammaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

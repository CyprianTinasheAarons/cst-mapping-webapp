import { configureStore } from "@reduxjs/toolkit";
import haloReducer from "../slices/halo/haloSlice";
import ingramReducer from "../slices/ingram/ingramSlice";
import bitdefenderReducer from "../slices/bitdefender/bitdefenderSlice";
import sentinelOneReducer from "../slices/sentinelOne/sentinelOneSlice";
import duoReducer from "../slices/duo/duoSlice";
import gammaReducer from "../slices/gamma/gammaSlice";
import ingramAutoSyncReducer from "../slices/ingram/ingramAutoSyncSlice";
import knowbe4Reducer from "../slices/knowbe4/knowbe4Slice";
import juroReducer from "../slices/juro/juroSlice";

export const store = configureStore({
  reducer: {
    halo: haloReducer,
    ingram: ingramReducer,
    bitdefender: bitdefenderReducer,
    sentinelOne: sentinelOneReducer,
    duo: duoReducer,
    gamma: gammaReducer,
    ingramAutoSync: ingramAutoSyncReducer,
    knowbe4: knowbe4Reducer,
    juro: juroReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

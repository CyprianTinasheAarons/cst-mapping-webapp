import { configureStore } from '@reduxjs/toolkit';
import haloReducer from '../features/halo/haloSlice';
import ingramReducer from '../features/ingram/ingramSlice';
import bitdefenderReducer from '../features/bitdefender/bitdefenderSlice';
import sentinelOneReducer from '../features/sentinelOne/sentinelOneSlice';
import supabaseReducer from '../features/supabase/supabaseSlice';
import duoReducer from '../features/duo/duoSlice';

export const store = configureStore({
  reducer: {
    halo: haloReducer,
    ingram: ingramReducer,
    bitdefender: bitdefenderReducer,
    sentinelOne: sentinelOneReducer,
    supabase: supabaseReducer,
    duo: duoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
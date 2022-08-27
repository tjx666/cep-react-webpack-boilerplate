import { configureStore } from '@reduxjs/toolkit';

import settingReducer from 'slices/settingSlice';

export const store = configureStore({
    reducer: {
        setting: settingReducer,
    },
    middleware: (getDefaultMiddlewares) => getDefaultMiddlewares({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

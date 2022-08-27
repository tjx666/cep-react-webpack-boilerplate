import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import localStore from 'utils/localStore';

interface SettingState {}

const localStoreSettingsKey = 'settings';
const initialState: SettingState = {};

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        adjustSettings(state: SettingState, action: PayloadAction<Partial<SettingState>>) {
            Object.assign(state, action.payload);
            localStore.setItem(localStoreSettingsKey, state);
        },
    },
});

export const { adjustSettings } = settingSlice.actions;
export default settingSlice.reducer;

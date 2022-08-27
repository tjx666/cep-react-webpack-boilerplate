import {
    TypedUseSelectorHook,
    useDispatch as _useDispatch,
    useSelector as _useSelector,
} from 'react-redux';

import type { AppDispatch, RootState } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useDispatch = () => _useDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = _useSelector;

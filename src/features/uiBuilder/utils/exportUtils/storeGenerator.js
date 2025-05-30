export const generateStoreJs = () => {
  return `import { configureStore } from '@reduxjs/toolkit';
import uiStateSlice from './uiStateSlice';

export const store = configureStore({
  reducer: {
    uiState: uiStateSlice,
  },
});

export default store;`;
};

export const generateUiStateSlice = () => {
  return `import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedFilters: {},
  appliedFilters: {},
  visibleColumns: {},
  sortConfigs: {},
};

export const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setSelectedFilterOptions: (state, action) => {
      const { tableComponentId, options } = action.payload;
      state.selectedFilters[tableComponentId] = {
        ...state.selectedFilters[tableComponentId],
        ...options
      };
    },
    applyFilters: (state, action) => {
      const { tableComponentId } = action.payload;
      state.appliedFilters[tableComponentId] = {
        ...state.appliedFilters[tableComponentId],
        ...state.selectedFilters[tableComponentId]
      };
    },
    clearFilters: (state, action) => {
      const { tableComponentId } = action.payload;
      state.appliedFilters[tableComponentId] = {};
      state.selectedFilters[tableComponentId] = {};
    },
    setVisibleColumns: (state, action) => {
      const { tableComponentId, columns } = action.payload;
      state.visibleColumns[tableComponentId] = columns;
    },
    setSortConfig: (state, action) => {
      const { groupName, config } = action.payload;
      state.sortConfigs[groupName] = config;
    },
    clearSortConfig: (state, action) => {
      const { groupName } = action.payload;
      delete state.sortConfigs[groupName];
    },
  },
});

export const { 
  setSelectedFilterOptions, 
  applyFilters, 
  clearFilters, 
  setVisibleColumns,
  setSortConfig,
  clearSortConfig
} = uiStateSlice.actions;
export default uiStateSlice.reducer;`;
};

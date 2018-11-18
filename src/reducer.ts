import { gridActionTypes } from "./actions";
import {GridStateCollection} from "./models";

const initialState: GridStateCollection = {
    grids: {}
};

export function reducer(state = initialState, action: {type: string, payload: any}): GridStateCollection {
    switch (action.type) {
        case gridActionTypes.GRID_SET_QUERY_PARAMETERS: {
            const {gridName, queryParameters} = action.payload;
            return {
                grids: {
                    ...state.grids,
                    [gridName]: {
                        ...state.grids[gridName],
                        queryParameters
                    }
                }
            }
        }
        case gridActionTypes.GRID_SET_QUERY_RESULT: {
            const {gridName, queryResult, queryResultParameters} = action.payload;
            return {
                grids: {
                    ...state.grids,
                    [gridName]: {
                        ...state.grids[gridName],
                        queryResult,
                        queryResultParameters
                    }
                }
            }
        }
        case gridActionTypes.GRID_SET_IS_LOADING: {
            const {gridName, isLoading} = action.payload;
            return {
                grids: {
                    ...state.grids,
                    [gridName]: {
                        ...state.grids[gridName],
                        isLoading
                    }
                }
            }
        }
        case gridActionTypes.GRID_SET_IS_RELOAD_REQUESTED: {
            const {gridName, isReloadRequested} = action.payload;
            return {
                grids: {
                    ...state.grids,
                    [gridName]: {
                        ...state.grids[gridName],
                        isReloadRequested
                    }
                }
            }
        }
        default: {
            return state;
        }
    }
}
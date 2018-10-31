import {Dispatch} from "redux";
import {QueryParameters, QueryResult} from "./models";

export const gridActionTypes = {
    GRID_SET_QUERY_PARAMETERS: "GRID_SET_QUERY_PARAMETERS",
    GRID_FETCH_DATA: "GRID_FETCH_DATA",
    GRID_SET_QUERY_RESULT: "GRID_SET_QUERY_RESULT",
    GRID_SET_IS_LOADING: "GRID_SET_IS_LOADING"
};

export const setGridQueryParameters = <T>(gridName: string, queryParameters: QueryParameters) => async (dispatch: Dispatch<any>, getState: any) => {
    dispatch({
        type: gridActionTypes.GRID_SET_QUERY_PARAMETERS,
        payload: { gridName, queryParameters }
    });
};

export const fetchData = <T>(gridName: string, dataRetrievalFunction: (queryParameters: QueryParameters) => Promise<QueryResult<T>>) => async (dispatch: Dispatch<any>, getState: any) => {


    dispatch({
        type: gridActionTypes.GRID_SET_IS_LOADING,
        payload: { gridName, isLoading: true }
    });

    try {
        const queryResultParameters = getState().grid.grids[gridName].queryParameters;
        const queryResult = await dataRetrievalFunction(queryResultParameters);

        dispatch({
            type: gridActionTypes.GRID_SET_QUERY_RESULT,
            payload: {gridName, queryResult, queryResultParameters}
        });
    } finally {

        dispatch({
            type: gridActionTypes.GRID_SET_IS_LOADING,
            payload: { gridName, isLoading: false }
        });
    }
};
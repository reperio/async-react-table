import {gridActionTypes} from "./actions";

export {QueryParameters, QueryResult} from "./models";
export {createGrid} from "./grid";
export {reducer} from "./reducer";

export function reloadGrid(gridName: string) {
    const isReloadRequested = true;
    return {
        type: gridActionTypes.GRID_SET_IS_RELOAD_REQUESTED,
        payload: { gridName, isReloadRequested }
    }
}
import {Filter, SortingRule} from "react-table";

export interface QueryParameters {
    page: number;
    pageSize: number;
    sorts: SortingRule[];
    filters: Filter[];
}

export interface QueryResult<T> {
    data: T[];
    count: number;
    pages: number;
}

export interface GridStateCollection {
    grids: {[gridName: string]: GridState}
}

export interface GridState {
    queryParameters: QueryParameters;
    queryResult: QueryResult<any>;
    queryResultParameters: QueryParameters;
    isLoading: boolean;
}

export interface State {
    grid: GridStateCollection;
}
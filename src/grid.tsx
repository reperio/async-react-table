import React, {ReactNode} from 'react'
import _ from "lodash";
import {connect, ConnectedComponentClass} from "react-redux";
import {bindActionCreators} from "redux";
import ReactTable, {Column, Filter, SortingRule} from "react-table";
import {setGridQueryParameters, fetchData} from "./actions";
import {QueryParameters, QueryResult, State} from "./models";

interface ComponentState {
    hasFirstFetchOccurred: boolean;
}

interface OwnProps<T> {
    initialQueryParameters?: QueryParameters;
    forceFetchOnMount?: boolean;
    dataRetrievalFunction: (queryParameters: QueryParameters) => Promise<QueryResult<T>>
}

interface StateProps<T> {
    isLoading: boolean;
    queryParameters: QueryParameters;
    queryResult: QueryResult<T>;
    queryResultParameters: QueryParameters;
}

interface DispatchProps<T> {
    actions: {
        setGridQueryParameters: (gridName: string, queryParameters: QueryParameters) => void;
        fetchData: (gridName: string, dataRetrievalFunction: (queryParameters: QueryParameters) => Promise<QueryResult<T>>) => void;
    }
}

type CombinedProps<T> = OwnProps<T> & StateProps<T> & DispatchProps<T>;

class Grid<T> extends React.Component<CombinedProps<T>, ComponentState> {
    props!: CombinedProps<T>;
    gridName!: string;

    static defaultProps: any = {
        initialQueryParameters: {page: 0, pageSize: 10, sorts: [], filters: []},
        forceFetchOnMount: true
    }

    constructor(props: OwnProps<T> & StateProps<T> & DispatchProps<T>) {
        super(props);
        this.state = {
            hasFirstFetchOccurred: false
        };
    }

    async componentDidMount() {
        await this.setGridQueryParameters(this.props.initialQueryParameters as QueryParameters);
        await this.fetchDataIfRequired();
    }

    async componentDidUpdate() {
        const newQueryParameters = this.fixInvalidQueryParameters(this.props.queryParameters);
        if (newQueryParameters !== this.props.queryParameters) {
            await this.setGridQueryParameters(newQueryParameters);
        }
        await this.fetchDataIfRequired();
    }

    fixInvalidQueryParameters(queryParameters: QueryParameters) {
        if (this.props.queryResult == null) {
            return queryParameters;
        }

        const currentPage = queryParameters.page;
        const lastPage = Math.max(this.props.queryResult.pages - 1, 0);
        const queryParametersWithFixedPage = currentPage > lastPage ? { ...this.props.queryParameters, page: lastPage } : queryParameters;
        return queryParametersWithFixedPage;
    }

    async setGridQueryParameters(newQueryParameters: QueryParameters) {
        await this.props.actions.setGridQueryParameters(this.gridName, newQueryParameters);
    }

    async fetchDataIfRequired() {
        const {hasFirstFetchOccurred} = this.state;
        if (!hasFirstFetchOccurred) {
            this.setState({...this.state, hasFirstFetchOccurred: true});
        }

        if (!this.props.forceFetchOnMount || hasFirstFetchOccurred) {
            if (this.props.isLoading || _.isEqual(this.props.queryParameters, this.props.queryResultParameters)) {
                return;
            }
        }

        await this.props.actions.fetchData(this.gridName, this.props.dataRetrievalFunction);
    }

    async onPageChange(pageIndex: number) {
        const queryParameters = {
            ...this.props.queryParameters,
            page: pageIndex
        };
        await this.setGridQueryParameters(queryParameters);
    }

    async onPageSizeChange(pageSize: number, pageIndex: number) {
        const queryParameters = {
            ...this.props.queryParameters,
            page: pageIndex,
            pageSize
        };
        await this.setGridQueryParameters(queryParameters);
    }

    async onSortedChange(sorts: SortingRule[], column: Column, shiftKey: boolean) {
        const queryParameters = {
            ...this.props.queryParameters,
            sorts
        };
        await this.setGridQueryParameters(queryParameters);
    }

    async onFilteredChange(filters: Filter[], column: Column) {
        const queryParameters = {
            ...this.props.queryParameters,
            filters
        };
        await this.setGridQueryParameters(queryParameters);
    }

    render() {
        const {isLoading, initialQueryParameters, queryParameters, queryResult, actions, ...reactTableProps} = this.props;

        const data = queryResult && queryResult.data || [];
        const pages = queryResult && queryResult.pages || 1;

        const page = queryParameters && queryParameters.page;
        const pageSize = queryParameters && queryParameters.pageSize || 10;
        const sorts = queryParameters && queryParameters.sorts || [] as SortingRule[];
        const filters = queryParameters && queryParameters.filters || [] as Filter[];

        return (
            <ReactTable manual
                        filterable
                        loading={isLoading}
                        minRows={0}
                        data={data}
                        pages={pages}

                        page={page}
                        pageSize={pageSize}
                        sorted={sorts}
                        filtered={filters}

                        onPageChange={this.onPageChange.bind(this)}
                        onPageSizeChange={this.onPageSizeChange.bind(this)}
                        onSortedChange={this.onSortedChange.bind(this)}
                        onFilteredChange={this.onFilteredChange.bind(this)}

                        {...(reactTableProps as any)} />
        );
    }
}

export function createGrid<T>(gridName: string): ConnectedComponentClass<typeof Grid, Pick<any, string | number | symbol> & OwnProps<T>> {

    function mapStateToProps(state: State): StateProps<T> {
        return {
            isLoading: state.grid.grids[gridName] && state.grid.grids[gridName].isLoading != null ? state.grid.grids[gridName].isLoading : false,
            queryParameters: state.grid.grids[gridName] && state.grid.grids[gridName].queryParameters || null,
            queryResult: state.grid.grids[gridName] && state.grid.grids[gridName].queryResult || null,
            queryResultParameters: state.grid.grids[gridName] && state.grid.grids[gridName].queryResultParameters || null
        };
    }

    function mapActionToProps(dispatch: any): DispatchProps<T> {
        return {
            actions: bindActionCreators({setGridQueryParameters, fetchData}, dispatch)
        };
    }

    class WrappedGrid<T> extends Grid<T> {
        constructor(props: any) {
            super(props);
            this.gridName = gridName;
        }
    }

    return connect<StateProps<T>, DispatchProps<T>, OwnProps<T>, State>(mapStateToProps, mapActionToProps)(WrappedGrid);
}
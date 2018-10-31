# async-react-table
A wrapper for react-table to make asynchronous sorting/paging/filtering a little bit easier.
## Prerequisites
This library requires:
* react-table
## Usage
```
import React from 'react'
import {createGrid, QueryParameters} from "async-react-table";
import {Column} from "react-table";
import {widgetService} from "../../services/widgetService";

const WidgetTable = createGrid("widget-table");

const WidgetList = () => {
    const columns: Column[] = [
        {
            Header: "Id",
            accessor: "id",
        },
        {
            Header: "Name",
            accessor: "name",
        }
    ];

    const initialQueryParameters: QueryParameters = {
        page: 0,
        pageSize: 10,
        sorts: [{id: "name"}],
        filters: []
    };

    return (
        <div>
            <WidgetTable columns={columns}
                         initialQueryParameters={initialQueryParameters}
                         dataRetrievalFunction={widgetService.getAllWidgetsUsingQueryParameters} />
        </div>
    )
};

export default WidgetList;
```
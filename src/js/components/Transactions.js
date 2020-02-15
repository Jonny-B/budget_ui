import React, {useState} from 'react'
import {Visibility, VisibilityOff} from '@material-ui/icons'
import MaterialTable from "material-table";
import CategoryDropdown from "./CategoryDropdown"
import * as TransactionsHelper from "../helpers/TransactionsHelper"

export default function Transactions(props) {

    const [showAll, SetShowAll] = useState(false);

    const handleShowAll = () => {
        TransactionsHelper.showAll(SetShowAll, showAll)
    };


    const handleUpdateDatabase = (updatedRowData, transactionId) => {
        TransactionsHelper.updateDatabase(updatedRowData, props.usertoken, transactionId)
    };

    const handleUpdateTransactionsVisibility = () => {
        TransactionsHelper.updateTransactionsVisibility(SetShowAll, showAll)
    };


    let showAllIcon = showAll ? <Visibility onClick={handleUpdateTransactionsVisibility}/> :
        <VisibilityOff onClick={handleUpdateTransactionsVisibility}/>;

    let data = showAll ? props.data : props.data.filter(row => {
        if (!row.hidden) return row
    });
    return (
        <div>
            <MaterialTable
                title={"Transactions"}
                options={{search: false, paging: false, actionsColumnIndex: -1}}
                columns={[
                    {
                        title: 'Category',
                        field: 'assignCategory',
                        render: rowData => <CategoryDropdown id={rowData.id}
                                                             assignedCategory={rowData.assignCategory}
                                                             callback={props.handleDropdownChange}
                                                             categories={props.categories}/>
                    },
                    {title: 'Date', field: 'date'},
                    {title: 'Description', field: 'description'},
                    {
                        title: 'Charge',
                        field: 'charge',
                        type: 'currency',
                    },
                    {
                        title: 'Hide',
                        field: 'hide',
                        render: rowData =>
                            rowData.hidden ? <VisibilityOff onClick={() => {
                                props.hideRow(rowData)
                            }}/> : <Visibility onClick={() => {
                                props.hideRow(rowData)
                            }}/>,
                    }
                ]}
                actions={[
                    {
                        icon: () => {
                            return showAllIcon
                        },
                        tooltip: 'Show Hidden',
                        isFreeAction: true,
                        onClick: () => {
                            handleShowAll()
                        }
                    }
                ]}
                data={data}/>
        </div>
    )
};

const styles = theme => ({});


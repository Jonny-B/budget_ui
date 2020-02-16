import axios from "axios";

export function showAll(SetShowAll, showAll) {
    SetShowAll(!showAll);
}

export function updateDatabase(updatedRowData, usertoken, transactionId) {
    axios.patch(`${process.env.REACT_APP_API_URL}/transactions/patch`, {
        updateData: updatedRowData,
        userToken: usertoken,
        transactionId: transactionId
    });
}

export function updateTransactionsVisibility(SetShowAll, showAll) {
    SetShowAll(!showAll);
}
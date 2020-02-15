import axios from "axios";

export function showAll(SetShowAll, showAll) {
    SetShowAll(!showAll);
}

export function updateDatabase(updatedRowData, usertoken, transactionId) {
    axios.patch('/transactions/patch', {
        updateData: updatedRowData,
        userToken: usertoken,
        transactionId: transactionId
    });
}

export function updateTransactionsVisibility(SetShowAll, showAll) {
    SetShowAll(!showAll);
}
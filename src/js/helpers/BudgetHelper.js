import axios from "axios";


export function seeTotals(props) {
    let iTotal = 0;
    let eTotal = 0;
    let sTotal = 0;

    if (props.data.incomeData.length > 0) iTotal =  parseFloat(props.data.incomeData.map(i => parseFloat(i.actual)).reduce((total, num) => total + num, 0).toFixed(2));
    if (props.data.expensesData.length > 0) eTotal = parseFloat(props.data.expensesData.map(e => parseFloat(e.actual)).reduce((total, num) => total + num, 0).toFixed(2));
    if (props.data.savingsData.length > 0) sTotal = parseFloat(props.data.savingsData.map(s => parseFloat(s.actual)).reduce((total, num) => total + num, 0).toFixed(2));

    // Set transfer to savings to iTotal out of if statement in case there is no Savings Data.
    let transferToSavings = iTotal;
    if (props.data.savingsData.length > 0) {
        let budgetedSavings = props.data.savingsData.map(s => parseFloat(s.budget)).reduce((total, num) => total + num, 0);
        transferToSavings = (iTotal + budgetedSavings) - (sTotal + eTotal);
    }


    return {incomeTotal: iTotal, expensesTotal: eTotal, savingsTotal: sTotal, transferToSavings: transferToSavings}
}

export function edit(SetOpen, SetRowData, rowData) {
    SetOpen(true);
    SetRowData(rowData)
}

export function add(category, type, handleAddCategory, userToken, date) {
    if (category.budget === null || category.budget === undefined || category.budget === 'NaN') category.budget = 0;
    axios.post(`${process.env.REACT_APP_API_URL}/budgets/create`, {
        budgeted: category.budget,
        type: type,
        userToken: userToken,
        category: category.category,
        date: date
    }).then(c => {
        handleAddCategory(category.category, category.budget, type, c.data.id);
    });
}

export function update(SetOpen, handleUpdate, updatedRowData) {
    SetOpen(false);
    handleUpdate(updatedRowData);
}

export function close(SetOpen) {
    SetOpen(false)
}

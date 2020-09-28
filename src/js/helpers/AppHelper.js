import axios from "axios";

export function createUserIfNecessary(allowCreateUserCheck, user, SetAllowCreateUserCheck, SetAllowDateLookup) {
    if (allowCreateUserCheck && user) {
        axios.post(`${process.env.REACT_APP_API_URL}/users/create`, {userToken: user.sub});
        SetAllowCreateUserCheck(false);
        SetAllowDateLookup(true)
    }
}

export function getDate(allowDateLookup, user, data, SetAllowDateLookup, SetData, SetAllowBudgetLookup) {
    if (allowDateLookup && user) {
        axios.get(`${process.env.REACT_APP_API_URL}/users`, {params: {userToken: user.sub}}).then(u => {
            let d = [...data];
            let date = u.data.last_viewed;
            if (date === null || date === undefined) {
                date = new Date();
                let year = date.getYear() + 1900;
                let month = date.getMonth() + 1;
                date = `${year}/${month}/${1}`
            }

            d[2].selectedDate = date;
            SetAllowDateLookup(false);
            SetData(d);
            SetAllowBudgetLookup(true);
        })
    }
}

export function getBudgetData(allowBudgetLookup, user, data, SetAllowBudgetLookup, SetData, SetAllowCategoryLookup) {
    if (allowBudgetLookup && user) {
        axios.get(`${process.env.REACT_APP_API_URL}/budgets`, {
            params: {
                userToken: user.sub,
                date: data[2].selectedDate
            }
        }).then(b => {
            let d = [...data];
            d[0].budgetData = b.data.budgetData;
            SetAllowBudgetLookup(false);
            SetData(d);
            SetAllowCategoryLookup(true);
        }).catch(e => {
            console.log('failed to get Budget Items')
        })
    }
}

export function getTransactionData(allowTransactionLookup, user, data, token, SetToken, SetOpenDialog, SetAllowTransactionLookup, SetData) {
    if (allowTransactionLookup && user) {
        //TODO Remove this if/else buxfer stuff when plaid gets their act together and starts working with cap one.
        if (user.buxfer !== undefined) {
            axios.get(`${process.env.REACT_APP_API_URL}/buxfer`, {
                params: {
                    userid: user.buxfer.userid,
                    password: user.buxfer.password,
                    userToken: user.sub,
                    date: data[2].selectedDate
                }
            }).then(t => {
                let d = [...data];
                d[1].transactionData = t.data.transactions;
                SetAllowTransactionLookup(false);
                SetData(d);
            })
        } else {
            axios.get(`${process.env.REACT_APP_API_URL}/transactions`, {
                params: {
                    userToken: user.sub,
                    date: data[2].selectedDate
                }
            }).then(t => {
                if (t.data.message === "ITEM_LOGIN_REQUIRED" && (token === undefined || token === "")) {
                    if (user) {
                        axios.get(`${process.env.REACT_APP_API_URL}/users/get_public_token`, {params: {userToken: user.sub}}).then(t => {
                            SetToken(t.data);
                            SetOpenDialog(true);
                        });
                    }

                } else {
                    let d = [...data];
                    d[1].transactionData = t.data.transactions;
                    SetAllowTransactionLookup(false);
                    SetData(d);
                }
            }).catch(e => {
                console.log('failed to get transactions')
            })
        }
    }
}

// export function getBuxferTransactions() {
//     axios.get(`https://www.buxfer.com/api/transactions?token=${token}`).then(data => {
//         let d = [...data];
//         // d[1].transactionData = 1;
//         SetAllowTransactionLookup(false);
//         axios.patch('/users/update_date', {
//             userToken: user.sub,
//             date: d[2].selectedDate
//         });
//     }).catch(e => {
//         console.log('failed to get transactions')
//     })
// }

export function getCategories(allowCategoryLookup, user, data, SetAllowCategoryLookup, SetCategories, SetAllowTransactionLookup) {
    if (allowCategoryLookup && user) {
        axios.get(`${process.env.REACT_APP_API_URL}/categories`, {
            params: {
                userToken: user.sub,
                date: data[2].selectedDate
            }
        }).then(category => {
            let categories = category.data;
            SetAllowCategoryLookup(false);
            SetCategories(categories);
            SetAllowTransactionLookup(true)
        }).catch(e => {
            console.log("Failed to get categories")
        })
    }
}

export function dropdownChange(transactionId, event, previousCategory, data, SetData, handleUpdateCategory, user, child) {
    let d = [...data];
    let row = [];
    let selectedCategory = child.key.split("_");
    let categoryId = selectedCategory[0];
    let categoryName = selectedCategory[1];
    let categoryType = selectedCategory[2];
    let date = data[2].selectedDate;

    d[1].transactionData.forEach((r) => {
        if (r.id === transactionId) {
            r.assignCategory = categoryName;
            row = r;
        }
    });
    SetData(d);
    axios.patch(`${process.env.REACT_APP_API_URL}/transactions/patch`, {
        updateData: row,
        userToken: user.sub,
        transactionId: transactionId,
        date: date
    });
    handleUpdateCategory(row, previousCategory);

    // Call update Savings bucket and set the new total
    if (categoryType === 'saving') updateSavingsBucket(null, categoryId, date, transactionId);
}

export function hideRow(updatedRowData, data, SetData, user) {
    let d = [...data];
    d[1].transactionData.forEach((row) => {
        if (row.id === updatedRowData.id) {
            row.hidden = !updatedRowData.hidden;
        }
    });
    SetData(d);
    axios.patch(`${process.env.REACT_APP_API_URL}/transactions/patch`, {
        updateData: updatedRowData,
        userToken: user.sub,
        date: data[2].selectedDate
    });
}

export function dateChange(date, data, user, SetData, SetAllowTransactionLookup, SetAllowBudgetLookup) {
    let year = date.getYear() + 1900;
    let month = date.getMonth() + 1;
    let d = [...data];
    d[2].selectedDate = `${year}/${month}/${1}`;
    axios.patch(`${process.env.REACT_APP_API_URL}/users/update_date`, {
        userToken: user.sub,
        date: d[2].selectedDate
    });
    SetData(d);
    SetAllowTransactionLookup(true);
    SetAllowBudgetLookup(true);
}

export function updateCategory(transaction, previousCategory, data, SetData) {
    let d = [...data];

    // Add to new category
    let incomeIndex = d[0].budgetData.incomeData.findIndex(i => i.category === transaction.assignCategory);
    let expenseIndex = d[0].budgetData.expenseData.findIndex(e => e.category === transaction.assignCategory);
    let savingIndex = d[0].budgetData.savingData.findIndex(s => s.category === transaction.assignCategory);
    let actual;
    if (incomeIndex !== -1) {
        actual = d[0].budgetData.incomeData[incomeIndex].actual;
        actual = (actual === "NaN" || actual === undefined) ? 0 : actual;
        d[0].budgetData.incomeData[incomeIndex].actual = (parseFloat(actual) + parseFloat(transaction.charge)).toString();
    } else if (expenseIndex !== -1) {
        actual = d[0].budgetData.expenseData[expenseIndex].actual;
        actual = (actual === "NaN" || actual === undefined) ? 0 : actual;
        d[0].budgetData.expenseData[expenseIndex].actual = (parseFloat(actual) + parseFloat(transaction.charge)).toString();
    } else if (savingIndex !== -1) {
        actual = d[0].budgetData.savingData[savingIndex].actual;
        actual = (actual === "NaN" || actual === undefined) ? 0 : actual;
        let distributed_total = d[0].budgetData.savingData[savingIndex].bucket.distributed_total;
        distributed_total = (distributed_total === "NaN" || distributed_total === undefined) ? 0 : distributed_total;

        d[0].budgetData.savingData[savingIndex].actual = (parseFloat(actual) + parseFloat(transaction.charge)).toString();
        d[0].budgetData.savingData[savingIndex].bucket.distributed_total = parseFloat(distributed_total) - parseFloat(transaction.charge);
        updateSavingsBucket(null, d[0].budgetData.savingData[savingIndex].id, data.selectedDate);
    }
    // Subtract from old category
    incomeIndex = d[0].budgetData.incomeData.findIndex(i => i.category === previousCategory);
    expenseIndex = d[0].budgetData.expenseData.findIndex(e => e.category === previousCategory);
    savingIndex = d[0].budgetData.savingData.findIndex(s => s.category === previousCategory);
    if (incomeIndex !== -1) {
        actual = d[0].budgetData.incomeData[incomeIndex].actual;
        d[0].budgetData.incomeData[incomeIndex].actual = (parseFloat(actual) - parseFloat(transaction.charge)).toString();
    } else if (expenseIndex !== -1) {
        actual = d[0].budgetData.expenseData[expenseIndex].actual;
        d[0].budgetData.expenseData[expenseIndex].actual = (parseFloat(actual) - parseFloat(transaction.charge)).toString();
    } else if (savingIndex !== -1) {
        actual = d[0].budgetData.savingData[savingIndex].actual;
        let distributed_total = d[0].budgetData.savingData[savingIndex].bucket.distributed_total;
        d[0].budgetData.savingData[savingIndex].actual = (parseFloat(actual) - parseFloat(transaction.charge)).toString();
        d[0].budgetData.savingData[savingIndex].bucket.distributed_total = (parseFloat(distributed_total) + parseFloat(transaction.charge)).toString();
        updateSavingsBucket(null, d[0].budgetData.savingData[savingIndex].id, data.selectedDate);
    }
    SetData(d)
}

export function addCategory(data, category, budget, type, id, updateCategories, SetData) {
    let d = [...data];
    // TODO go around and fix this so you aren't using plural sometimes and not others. Doing this here will make the app very britle.
    d[0].budgetData[`${type}Data`].push({category: category, budget: budget, actual: 0, type: type, id: id});
    updateCategories(category);
    SetData(d);
}

export function updateCategories(categories, newCategory, SetCategories, SetAllowCategoryLookup, SetAllowBudgetLookup) {
    // let cats = [...categories];
    // cats.push(newCategory);
    // SetCategories(cats);
    SetAllowBudgetLookup(true);
    SetAllowCategoryLookup(true);

}

export function deleteCategory(oldData, data, categories, SetCategories, SetData) {
    axios.delete(`${process.env.REACT_APP_API_URL}/categories/delete`, {params: {id: oldData.id}});

    let d = [...data];

    data[1].transactionData.forEach((t) => {
        if (t.assignCategory === oldData.category) {
            t.assignedCategory = ""
        }

    });
    let cats = [...categories];
    cats.forEach((c, i) => {
        if (c === oldData.category) {
            cats.splice(i, 1);
        }
    });
    SetCategories(cats);
    SetData(d);
}

export function verifyAccount(SetOpenDialog, SetAllowTransactionLookup) {
    SetOpenDialog(false);
    SetAllowTransactionLookup(true);
}

export function accountLink(token, user, SetAllowTransactionLookup) {
    if (user) {
        axios.post(`${process.env.REACT_APP_API_URL}/users/set_plaid_token`, {userToken: user.sub, plaidToken: token});
    }
    SetAllowTransactionLookup(true);
}

export function update(updatedRowData, data, SetAllowTransactionLookup, SetData, categories, SetCategories) {
    axios.patch(`${process.env.REACT_APP_API_URL}/categories/patch`, {
        id: updatedRowData.id,
        category: updatedRowData.category,
        budgeted: updatedRowData.budget,
        date: data[2].selectedDate
    });
    let d = [...data];
    let oldCategory = "";
    data[0].budgetData[`${updatedRowData.type}Data`].forEach((b) => {
        if (b.id === updatedRowData.id) {
            oldCategory = b.category;
            b.category = updatedRowData.category;
            b.budget = updatedRowData.budget;
        }

    });
    data[1].transactionData.forEach((t) => {
        if (t.assignCategory === oldCategory) {
            t.assignedCategory = updatedRowData.category
        }

    });
    SetAllowTransactionLookup(true);
    SetData(d);
    let cats = [...categories];
    cats.forEach((c, i) => {
        if (c === oldCategory) {
            cats[i] = updatedRowData.category;
        }
    });
    SetCategories(cats)
}

// Called when updating the distribution column. Called on blur.
// Also called when a transaction is assigned to a category.
export function updateSavingsBucket(updatedDistValue, id, date) {
    axios.patch(`${process.env.REACT_APP_API_URL}/buckets/patch`, {
        categoryId: id,
        updatedDistValue: updatedDistValue,
        date: date,
    });
}
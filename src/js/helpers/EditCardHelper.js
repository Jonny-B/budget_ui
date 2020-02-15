// The name of the category
export function categoryChange(data, setData, event) {
    let d = {...data};
    d.category = event.target.value;
    setData(d);
}

// The dollar amount of the budget category
export function budgetChange(data, SetData, event) {
    let d = {...data};
    d.budget = event.target.value.replace('$', '');
    SetData(d);
}

// Fires when update button is clicked
export function update(callback, data) {
    callback(data)
}
import React, {useState} from 'react'
import {TextField, Button, Typography} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import {makeStyles} from '@material-ui/core/styles';
import {Lock} from '@material-ui/icons'
import * as EditCardHelper from '../helpers/EditCardHelper';

export default function EditCard(props) {
    //todo material table has an editable feature. Implement that because it makes me have to write less code.
    const [data, SetData] = useState(props.data);

    const handleCategoryChange = (event) => {
        EditCardHelper.categoryChange(data, SetData, event)
    };

    const handleBudgetChange = (event) => {
        EditCardHelper.budgetChange(data, SetData, event)
    };

    const handleUpdate = () => {
        EditCardHelper.update(props.callback, data)
    };

    let categoryCol = data.category !== undefined ?
        <CategoryCol data={data} handleCategoryChange={handleCategoryChange}/> : <></>;
    let budgetCol = data.budget !== undefined ?
        <BudgetCol data={data} handleBudgetChange={handleBudgetChange}/> : <></>;
    let actual = data.actual !== undefined ? <Actual data={data}/> : <></>;
    let bucketTotal = data.bucketTotal !== undefined ? <BucketTotal data={data}/> : <></>;

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            {categoryCol}
            {budgetCol}
            {actual}
            {bucketTotal}
            <Button onClick={handleUpdate} variant={"contained"}>Update</Button>
        </MuiPickersUtilsProvider>
    )
}

const CategoryCol = (props) => {
    return (<TextField id={'categoryCol'} label={'Category Name'} onChange={props.handleCategoryChange}
                       defaultValue={props.data.category}/>)
};

const BudgetCol = (props) => {
    return (<TextField id={'budgetCol'} label={'Budget'} onChange={props.handleBudgetChange}
                       defaultValue={`$${props.data.budget}`}/>)

};

const Actual = (props) => {
    return (<Typography id={'actual'}>{`Actual: $${props.data.actual}`} <Lock/></Typography>)
};

const BucketTotal = (props) => {
    return (<Typography id={'savingsBucket'}>{`Savings Bucket: $${props.data.bucketTotal}`} <Lock/></Typography>)
};

const useStyles = makeStyles(theme => ({}));
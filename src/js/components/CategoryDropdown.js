import React, {Component} from 'react'
import {withStyles} from '@material-ui/core/styles';
import {MenuItem, Select} from "@material-ui/core";
import * as CategoryDropdownHelper from '../helpers/CategoryDropdownHelper'

export default function CategoryDropdown(props) {
    function handleDropdownChange(event, child) {
        CategoryDropdownHelper.dropdownChange(props.callback, props.id, event, props.assignedCategory, child)
    }

    let count = 0;

    return (
        <div id={'categoryDropdown'}>
            <Select onChange={(event, child) => handleDropdownChange(event, child)} value={props.assignedCategory}>
                <MenuItem id={`${props.id}#${count}`} key={`${props.id}${count}`} value="Select One">
                    Select One
                </MenuItem>
                {props.categories.map((category) => {
                    count += 1;
                    return <MenuItem key={`${category.id}_${category.category}_${category.category_type}`} value={category.category}>{category.category}</MenuItem>
                })}
            </Select>
        </div>
    )

}

const styles = theme => ({});
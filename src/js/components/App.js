import React, {useState, useEffect} from 'react';
import {Grid, Typography, Button, DialogTitle, Dialog} from '@material-ui/core';
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import ShowChart from '@material-ui/icons/ShowChart';
import Budget from './Budget'
import Transactions from './Transactions'
import DateFnsUtils from "@date-io/date-fns";
import PlaidLink from 'react-plaid-link'
import NavBar from "./NavBar";
import {useAuth0} from "../../react-auth0-wrapper";
import * as AppHepler from '../helpers/AppHelper'
import axios from "axios/index";

// TODO look and feel sucks.
// TODO when hiding a transaction. If it has a category selected that category will be mapped to the transaction that moves into its space. This is just graphical as it doesn't effect totals and is fixed on refresh.
// TODO clicking the add button makes the table shrink rather than open the form.
// TODO hiding should clear selected category.
// TODO write tests.


export default function App(props) {

    //user has a sub which is a unique identifier
    const {isAuthenticated, loginWithRedirect, logout, user} = useAuth0();

    const [publicKey, SetPublicKey] = useState(false);
    const [allowCreateUserCheck, SetAllowCreateUserCheck] = useState(true);
    const [allowDateLookup, SetAllowDateLookup] = useState(false);
    const [allowTransactionLookup, SetAllowTransactionLookup] = useState(false);
    const [allowBudgetLookup, SetAllowBudgetLookup] = useState(false);
    const [allowCategoryLookup, SetAllowCategoryLookup] = useState(false);
    const [categories, SetCategories] = useState([]);
    const [openDialog, SetOpenDialog] = useState(false);
    const [token, SetToken] = useState("");
    const [data, SetData] = useState([
        {
            budgetData:
                {
                    incomeData: [],
                    expensesData: [],
                    savingsData: []
                }

        },
        {
            transactionData: []
        },
        {
            selectedDate: ""
        }
    ]);


    useEffect(() => {
        handleCreateUserIfNecessary();
        handleGetDate();
        handleGetBudgetData();
        handleGetCategories();
        handleGetTransactionData();
    });

    const handleCreateUserIfNecessary = () => {
        AppHepler.createUserIfNecessary(allowCreateUserCheck, user, SetAllowCreateUserCheck, SetAllowDateLookup)
    };

    const handleGetDate = () => {
        AppHepler.getDate(allowDateLookup, user, data, SetAllowDateLookup, SetData, SetAllowBudgetLookup)
    };

    const handleGetBudgetData = () => {
        AppHepler.getBudgetData(allowBudgetLookup, user, data, SetAllowBudgetLookup, SetData, SetAllowCategoryLookup);
    };

    const handleGetTransactionData = () => {
        AppHepler.getTransactionData(allowTransactionLookup, user, data, token, SetToken, SetOpenDialog, SetAllowTransactionLookup, SetData)
    };

    const handleGetCategories = () => {
        AppHepler.getCategories(allowCategoryLookup, user, data, SetAllowCategoryLookup, SetCategories, SetAllowTransactionLookup)
    };

    const handleDropdownChange = (transactionId, event, previousCategory) => {
        AppHepler.dropdownChange(transactionId, event, previousCategory, data, SetData, handleUpdateCategory, user)
    };

    const handleHideRow = (updatedRowData) => {
        AppHepler.hideRow(updatedRowData, data, SetData, user)
    };

    const handleDateChange = (date) => {
        AppHepler.dateChange(date, data, user, SetData, SetAllowTransactionLookup, SetAllowBudgetLookup)
    };

    const handleUpdateCategory = (transaction, previousCategory) => {
        AppHepler.updateCategory(transaction, previousCategory, data, SetData)
    };

    const handleAddCategory = (category, budget, type, id) => {
        AppHepler.addCategory(data, category, budget, type, id, handleUpdateCategories, SetData)
    };

    const handleUpdateCategories = (newCategory) => {
        AppHepler.updateCategories(categories, newCategory, SetCategories, SetAllowCategoryLookup)
    };

    const handleDeleteCategory = oldData => {
        AppHepler.deleteCategory(oldData, data, categories, SetCategories, SetData)
    };

    const handleOpenClosePlaid = () => {
        // this.setState({plaidModalOpen: !this.state.plaidModalOpen})
    };

    const handleVerifyAccount = () => {
        AppHepler.verifyAccount(SetOpenDialog, SetAllowTransactionLookup)
    };

    const handleAccountLink = (token) => {
        AppHepler.accountLink(token, user, SetAllowTransactionLookup);
    };

    const handleOnExit = () => {
    };

    const handleUpdate = (updatedRowData) => {
        AppHepler.update(updatedRowData, data, SetAllowTransactionLookup, SetData, categories, SetCategories)
    };

    const copyBudget = (month) => {
        axios.patch('/budgets/copy', {
            month: month,
            userToken: user.sub,
            date: data[2].selectedDate
        }).then(() => {
            console.log("Successfully Copied")
        });
    };

    return (
        <MuiThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container spacing={3} className="App">
                    <Grid item xs={12}> <NavBar isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect}
                                                logout={logout} user={user}/> </Grid>
                    <Grid item xs={6}> <Typography> Budget Easy </Typography> </Grid>
                    <Grid item xs={3}> <Button variant={"contained"}><ShowChart/></Button> </Grid>
                    <div>
                        <Typography>Copy Other Month Budget</Typography>
                        <Grid item xs={3}> <Button onClick={() => copyBudget("last")} variant={"contained"}>Last</Button> </Grid>
                        <Grid item xs={3}> <Button onClick={() => copyBudget("next")} variant={"contained"}>Next</Button> </Grid>
                    </div>
                    <Grid item xs={3}>
                        {isAuthenticated && <PlaidLink
                            clientName="Budget"
                            env="development"
                            product={["transactions"]}
                            publicKey="d010207ffa5ab886eea1b7f31471f3"
                            onExit={handleOnExit}
                            onSuccess={handleAccountLink}>
                            Link Account Transactions
                        </PlaidLink>}
                    </Grid>
                    <Grid item xs={12}>
                        {data[2].selectedDate !== "" ? <DatePicker
                            views={["year", "month"]}
                            label="Budget Date"
                            helperText="Choose Month/Year"
                            minDate={new Date("2000-01-01")}
                            value={data[2].selectedDate}
                            onChange={handleDateChange}
                        /> : <></>}
                    </Grid>
                    <Grid item xs={6}>
                        {
                            (data[0].budgetData.incomeData.length !== 0 || data[0].budgetData.expensesData.length !== 0 || data[0].budgetData.savingsData.length !== 0) ?
                                <Budget
                                    date={data[2].selectedDate}
                                    data={data[0].budgetData}
                                    userToken={user.sub}
                                    handleUpdate={handleUpdate}
                                    handleDeleteCategory={handleDeleteCategory}
                                    handleAddCategory={handleAddCategory}
                                /> :
                                <Typography>
                                    Loading ...
                                </Typography>
                        }
                    </Grid>
                    <Grid item xs={6}>
                        {
                            (data[1].transactionData !== undefined && data[1].transactionData.length !== 0) ?
                                <Transactions
                                    selectedMonth={data[2].selectedDate}
                                    data={data[1].transactionData}
                                    categories={categories}
                                    userToken={user.sub}
                                    handleUpdateCategory={handleUpdateCategory}
                                    handleDropdownChange={handleDropdownChange}
                                    hideRow={handleHideRow}
                                /> :
                                <Typography>
                                    Loading ...
                                </Typography>
                        }
                    </Grid>
                </Grid>
                <Dialog open={openDialog}>
                    <DialogTitle id="verify-dialog">Verify Linked Account</DialogTitle>
                    <Typography>Your Financial Institution would like you to verify you credentials. Click below to Verify.</Typography>
                    {openDialog && <PlaidLink
                        clientName="Budget"
                        env="sandbox"
                        token={token}
                        product={["transactions"]}
                        publicKey="d010207ffa5ab886eea1b7f31471f3"
                        onEvent={() => SetOpenDialog(false)}
                        onExit={handleOnExit}
                        onSuccess={handleVerifyAccount}>
                        Verify
                    </PlaidLink>}
                </Dialog>
            </MuiPickersUtilsProvider>
        </MuiThemeProvider>
    )
};

const theme = createMuiTheme({
    palette: {
        primary: {main: '#2E7C31'}, // Provided by UX, meets contrast standards
        background: {default: '#f2f7fa'},
        action: {
            coveragesHover: 'rgba(46, 124, 49, .4)' // Main color at 40% opacity
        },
        common: {black: '#333333'},
    },
    typography: {
        //Utilize any necessary v2 variants until next version is released.
        useNextVariants: true,
        fontFamily: 'Open Sans, sans-serif',
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 600,
        h1: {
            color: 'rgba(0, 0, 0, 0.87)',
            fontWeight: '500',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '2.0rem',
            padding: '25px',
        },
        h2: {
            color: 'rgba(0, 0, 0, 0.87)',
            fontWeight: '400',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.5rem',
            padding: '25px',
        },
        h3: {
            color: 'rgba(0, 0, 0, 0.87)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.25rem',
            padding: '25px',
        },
        h4: {
            color: 'rgba(0, 0, 0, 0.87)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.0rem',
            padding: '25px',
        },
        h5: {
            color: 'rgba(0, 0, 0, 0.87)',
            paddingBottom: '25px',
            paddingTop: '25px',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.75rem',
        },
        subtitle1: {
            fontSize: '1rem',
            fontFamily: 'Open Sans, sans-serif',
            fontWeight: '400',
            lineHeight: '1.5',
        }
    }
});
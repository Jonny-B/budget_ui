import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import * as AppHelper from "../../helpers/AppHelper"

describe('AppHelper', () => {
    describe('createUserIfNecessary', () => {
        it('should not execute if NOT allowCreateUserCheck', () => {
            let allowCreateUserCheck = false;
            let SetAllowCreateUserCheck = jest.fn();
            AppHelper.createUserIfNecessary(allowCreateUserCheck, {userName: 'test'}, SetAllowCreateUserCheck, () => {
            });
            expect(SetAllowCreateUserCheck.mock.calls.length).toBe(0);
        });

        it('should not execute if NOT user', () => {
            let user = null;
            let SetAllowCreateUserCheck = jest.fn();
            AppHelper.createUserIfNecessary(true, user, SetAllowCreateUserCheck, () => {
            });
            expect(SetAllowCreateUserCheck.mock.calls.length).toBe(0);
        });

        it('should execute if allowCreateUserCheck and User', () => {
            let SetAllowCreateUserCheck = jest.fn();
            AppHelper.createUserIfNecessary(true, {userName: 'test'}, SetAllowCreateUserCheck, () => {
            });
            expect(SetAllowCreateUserCheck.mock.calls.length).toBe(1);
        });

        it('should call user/create and then update data with last viewed date and set allowDateLookup/allowDateLookup to false/true', () => {
            let mock = new MockAdapter(axios);
            mock.onGet('/users').reply(200, {data: {last_viewed: '01/01/2020'}});
            let allowCreateUserCheck = true;
            let allowDateLookup = false;
            let user = {userName: 'test'};
            let SetAllowCreateUserCheck = (x) => {
                allowCreateUserCheck = x
            };
            let SetAllowDateLookup = (x) => {
                allowDateLookup = x
            };

            AppHelper.createUserIfNecessary(allowCreateUserCheck, user, SetAllowCreateUserCheck, SetAllowDateLookup);
            expect(allowCreateUserCheck).toBe(false);
            expect(allowDateLookup).toBe(true);
        })
    });

    describe('getDate', () => {
        it('should not execute if NOT allowDateLookup', () => {
            let allowDateLookup = false;
            let user = null;
            let data = [];
            let SetAllowDateLookup = jest.fn();
            let SetData = () => {
            };
            let SetAllowBudgetLookup = () => {
            };
            AppHelper.getDate(allowDateLookup, user, data, SetAllowDateLookup, SetData, SetAllowBudgetLookup);
            expect(SetAllowDateLookup.mock.calls.length).toBe(0);
        });

        it('should not execute if NOT user', () => {
            let allowDateLookup = true;
            let user = {userName: 'test'};
            let data = [];
            let SetAllowDateLookup = jest.fn();
            let SetData = () => {
            };
            let SetAllowBudgetLookup = () => {
            };
            AppHelper.getDate(allowDateLookup, user, data, SetAllowDateLookup, SetData, SetAllowBudgetLookup);
            expect(SetAllowDateLookup.mock.calls.length).toBe(0);
        });

        it('should get last viewed date from user', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/users').reply(200, {last_viewed: '2020/01/01'});
            let allowDateLookup = true;
            let user = true;
            let data = [{}, {}, {selectedDate: '0000/00/00'}];
            let SetData = (d) => {
                expect(d[2].selectedDate).toBe('2020/01/01');
                done()
            };

            AppHelper.getDate(allowDateLookup, user, data, ()=>{}, SetData, ()=>{});
        });

        it('should call SetAllowDateLookup', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/users').reply(200, {last_viewed: '2020/01/01'});
            let allowDateLookup = true;
            let user = true;
            let data = [{}, {}, {selectedDate: '0000/00/00'}];
            let SetAllowDateLookup = (x) => {
                expect(x).toBe(false);
                done();
            };
            AppHelper.getDate(allowDateLookup, user, data, SetAllowDateLookup, ()=>{}, ()=>{});
        });

        it('should call SetAllowBudgetLookup', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/users').reply(200, {last_viewed: '2020/01/01'});
            let allowDateLookup = true;
            let user = true;
            let data = [{}, {}, {selectedDate: '0000/00/00'}];
            let SetAllowBudgetLookup = (x) => {
                expect(x).toBe(true);
                done();
            };
            AppHelper.getDate(allowDateLookup, user, data, ()=>{}, ()=>{}, SetAllowBudgetLookup);
        });

        it('should get todays date in yyyy/mm/dd if user has no last_viewed date set', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/users').reply(200, {data: null});
            let allowDateLookup = true;
            let user = true;
            let data = [{}, {}, {selectedDate: '0000/00/00'}];
            let SetData = (d) => {
                let date = new Date();
                let year = date.getYear() + 1900;
                let month = date.getMonth() + 1;
                date = `${year}/${month}/${1}`;
                expect(d[2].selectedDate).toBe(date);
                done();
            };

            AppHelper.getDate(allowDateLookup, user, data, ()=>{}, SetData, ()=>{});
        })
    });

    describe('getBudgetData', () => {
        it('should not execute if NOT allowBudgetLookup', (done) => {
            allowBudgetLookup = false;
            user=true;
            data=[];
            SetAllowBudgetLookup = jest.fn();
            SetData = () => {};
            SetAllowCategoryLookup = () => {};

            AppHelper.getBudgetData(allowBudgetLookup, user, data, SetAllowBudgetLookup, SetData, SetAllowCategoryLookup);

            expect(SetAllowBudgetLookup.mock.calls.length).toBe(0)
        });

        it('should not execute if NOT user', () => {
            allowBudgetLookup = true;
            user=null;
            data=[];
            SetAllowBudgetLookup = jest.fn();
            SetData = () => {};
            SetAllowCategoryLookup = () => {};

            AppHelper.getBudgetData(allowBudgetLookup, user, data, SetAllowBudgetLookup, SetData, SetAllowCategoryLookup);

            expect(SetAllowBudgetLookup.mock.calls.length).toBe(0)
        });

        it('should get budget data', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/budgets').reply(200, {budgetData: 'TEST'});
            let allowBudgetLookup = true;
            let user = true;
            let data = [{budgetData}, {}, {}];
            let SetData = (d) => {
                expect(d[0].budgetData).toBe('TEST');
                done()
            };

            AppHelper.getBudgetData(allowBudgetLookup, user, data, ()=>{}, SetData, ()=>{});
        });

        it('should call SetAllowDateLookup', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/budgets').reply(200, {budgetData: 'TEST'});
            let allowBudgetLookup = true;
            let user = true;
            let data = [{budgetData}, {}, {}];
            let SetAllowBudgetLookup = (x) => {
                expect(x).toBe(false);
                done();
            };
            AppHelper.getBudgetData(allowBudgetLookup, user, data, SetAllowBudgetLookup, ()=>{}, ()=>{});
        });

        it('should call SetAllowBudgetLookup', (done) => {
            let mock = new MockAdapter(axios);
            mock.onGet('/budgets').reply(200, {budgetData: 'TEST'});
            let allowBudgetLookup = true;
            let user = true;
            let data = [{budgetData}, {}, {}];
            let SetAllowCategoryLookup = (x) => {
                expect(x).toBe(true);
                done();
            };
            AppHelper.getBudgetData(allowBudgetLookup, user, data, ()=>{}, ()=>{}, SetAllowCategoryLookup);
        });
    })
});

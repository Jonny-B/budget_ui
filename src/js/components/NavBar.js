import React from "react";
import {Button} from '@material-ui/core'

const NavBar = (props) => {
    const {isAuthenticated, loginWithRedirect, logout} = props;

    return (
        <div>
            {!isAuthenticated && <Button onClick={() => loginWithRedirect({})} variant={"contained"}> Log in </Button>}
            {isAuthenticated && <Button onClick={() => logout()} variant={"contained"}>Log out</Button>}
        </div>
    );
};

export default NavBar;
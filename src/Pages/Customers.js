import React, { useState, useEffect } from 'react';
import { baseAPIUrl } from '../config/endpoints';
import { BrowserRouter as Router, Route, useHistory, Redirect } from 'react-router-dom'
import Modal from '../components/ui/Modal';
import { Breadcrumbs, Card, Typography } from '@material-ui/core';
import { Badge, CircularProgress, TableBody, TableCell, TableRow, TableFooter, Avatar, Toolbar, InputAdornment, IconButton, FormControl, Tooltip } from '@material-ui/core'
import Controls from '../components/Controls'
import { FilterList, Search } from '@material-ui/icons'
import useTable from '../components/useTable'
import axios from 'axios'
import Header from '../components/Header';
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';


const headCells = [
    {
        id: 'Id',
        label: 'ID#'
    },
    {
        id: 'Customer',
        label: 'Customer'
    },
    {
        id: 'Mobile Number',
        label: 'Mobile Number'
    },
    {
        id: 'Email',
        label: 'Email'
    },
    {
        id: 'Status',
        label: 'Status'
    },
    {
        id: 'Actions',
        label: 'Actions',
        disableSorting: true
    }
]

const getJWTToken = () => {
    return localStorage.getItem("JWT_TOKEN");
}
function Customers() {
    const ITEM_HEIGHT = 48;
    const history = useHistory();
    const [filterFn, setFilterFn] = useState({ fn: items => { return items; } })
    const JWT_TOKEN = localStorage.getItem("JWT_TOKEN")
    const [isLoggedIn, setisLoggedIn] = useState(true)
    const [isLoading, setLoading] = useState(true)
    const [customers, setCustomers] = useState([]);

    const { TblContainer, TblHead, TblPagination, recordsAfterPagingAndSorting } = useTable(customers, headCells, [25, 50, 100, 500, { value: -1, label: 'All' }], filterFn)

    const handleSearch = (e) => {
        let target = e.target
        setFilterFn({
            fn: items => {
                if (target.value == "")
                    return items;
                else
                    items.filter(x => x.category_name.includes(target.value))
            }
        })
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getAllCustomers = () => {
        if (navigator.onLine) {
            axios.get(baseAPIUrl + 'customers', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + getJWTToken()
                }
            }).then(response => {
                setLoading(false);
                if (response.status === 200 && response.data.success) {
                    setCustomers(response.data.RESPONSE.customers);
                }
            }).catch(error => {
                setLoading(false);
                if (error.response.status === 401 && !error.response.data.status) {
                    Notification(error.response.data.RESPONSE.error_message, "error");
                } else if (error.response.status === 403 && !error.response.data.status) {
                    Notification(error.response.data.RESPONSE.error_message, "error");
                } else {
                    Notification("something went wrong, please try again!", "error");
                }
            })
        } else {
            Notification("You are Offline! 🌐", "warning");
        }
    }

    const deleteCustomer = (customerId) => {

    }

    useEffect(() => {
        if (JWT_TOKEN == null) {
            setisLoggedIn(false)
        } else {
            getAllCustomers();
        }
    }, [])

    if (isLoggedIn === false) {
        return <Redirect to="/login" />
    }
    return (
        <React.Fragment>
            <Header />
            <Sidebar />
            <main>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link color="inherit" to="/">
                        Home
                </Link>
                    <Typography color="textPrimary">Customers</Typography>
                </Breadcrumbs>
                {
                    isLoading ? (
                        <div style={{ position: 'absolute', top: '13%', left: '46%' }}>
                            <CircularProgress size={50} />
                        </div>
                    ) : (
                        <React.Fragment>
                            <div className="content">

                                <Card>
                                    <div className="card-header header-elements-inline">
                                        <h5 className="card-title font-weight-semibold">All Customers </h5>
                                    </div>

                                    <Toolbar className="d-flex justify-content-between">
                                        <FormControl>
                                            <Controls.TextField
                                                placeholder="Type to Filter"
                                                variant="standard"
                                                InputProps={{
                                                    startAdornment: (<InputAdornment position="start">
                                                        <Search />
                                                    </InputAdornment>)
                                                }}
                                                onChange={handleSearch}
                                            />
                                        </FormControl>
                                    </Toolbar>

                                    <TblContainer>
                                        <TblHead />
                                        <TableBody>
                                            {
                                                recordsAfterPagingAndSorting().map(customer => {
                                                    return (
                                                        <TableRow key={customer.customer_id}>
                                                            <TableCell>{customer.customer_id}</TableCell>
                                                            <TableCell>
                                                                {customer.customer_first_name + " " + customer.customer_last_name}
                                                            </TableCell>
                                                            <TableCell>+91{customer.customer_mobile_number}</TableCell>
                                                            <TableCell>{customer.customer_email_address}</TableCell>
                                                            <TableCell>
                                                                {customer.customer_status == 1 ? (
                                                                    <Badge badgeContent={"Active"} color="primary" />
                                                                ) : (
                                                                    <Badge badgeContent={"Deactivate"} color="secondary" />
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <IconButton
                                                                        aria-label="more"
                                                                        aria-controls="long-menu"
                                                                        aria-haspopup="true"
                                                                        onClick={handleClick}
                                                                    >
                                                                        <MoreVertIcon />
                                                                    </IconButton>
                                                                    <Menu
                                                                        id="long-menu"
                                                                        anchorEl={anchorEl}
                                                                        keepMounted
                                                                        open={open}
                                                                        onClose={handleClose}
                                                                    >
                                                                        <MenuItem onClick={handleClose}>
                                                                            Edit
                                                                    </MenuItem>

                                                                        <MenuItem onClick={handleClose}>
                                                                            Delete
                                                                    </MenuItem>
                                                                    </Menu>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            }
                                        </TableBody>
                                    </TblContainer>
                                    <TableFooter>
                                        <TblPagination />
                                    </TableFooter>
                                </Card>
                            </div>
                        </React.Fragment>
                    )
                }
            </main>
        </React.Fragment>
    )
}

export default Customers

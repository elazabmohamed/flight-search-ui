import React, { useState, useEffect, useRef } from 'react';

// For mock api
import axios from 'axios';

//  Datepicker imports
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

//  Search form imports
import { FormControl, FormControlLabel, Checkbox, Button } from '@mui/material';
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

//  Result table imports
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import SwapVertIcon from '@mui/icons-material/SwapVert';

import Alert from '@mui/material/Alert';

import Loading from '../../Common/Components/Loading/Loading';
import { defaultLogo } from '../../Images/ImageComponents';

//  Airports data
import airports from '../../Common/Data/airports.json'
//  Style
import './searchFlights.css'

const API_URL = 'http://localhost:3001/flights';

const rowsPerPageOptions = [5, 10, 25];

const SearchFlights = () => {
    const [flights, setFlights] = useState([]);
    const [departureAirportFilter, setDepartureAirportFilter] = useState(null);
    const [arrivalAirportFilter, setArrivalAirportFilter] = useState('');
    const [departureDateFilter, setDepartureDateFilter] = useState(null);
    const [returningDateFilter, setReturningDateFilter] = useState(null);
    const [isOneWay, setIsOneWay] = useState(false);
    const [filteredFlights, setFilteredFlights] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc');
    const [isLoading, setIsLoading] = useState(true);
    const [clearAllInputs, setClearAllInputs] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const scrollRef = useRef(null);

    useEffect(() => {
        document.title = "Search Flight | amadeus";
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (clearAllInputs) {
            setDepartureAirportFilter('');
            setArrivalAirportFilter('');
            setDepartureDateFilter(null);
            setReturningDateFilter(null);
            setIsOneWay(false);

            // Reset the flag to false
            setClearAllInputs(false);
        }
    }, [clearAllInputs]);


    //  A function used to scroll down to results
    function scrollDown() {
        scrollRef.current?.scrollIntoView({ block: "start", behavior: 'smooth' });
    }

    // Reset all state variables
    const handleClearAllInputs = () => {
        setClearAllInputs(true);
    };


    // Fetching data from the api
    /*  
    a loading icon will show untill the data is fetched, 
    however, to simulate that situation 
    i added a timeout so you can see the result. 
    */
    const fetchData = () => {
        setIsLoading(true);

        setTimeout(() => {
            axios.get(API_URL)
                .then(response => {
                    setFlights(response.data);
                    setFilteredFlights(response.data);
                })
                .catch(error => console.error('Error fetching flights:', error))
                .finally(() => {
                    setIsLoading(false);
                });
        }, 500); // Simulating a delay of 1 seconds
    };


    //  Formatting the input of dates
    const formatDateInput = (date) => {
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' }).format(date);
    };

    const formatDateOutput = (dateString) => {
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            timeZoneName: 'short',
        };

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'NA';
        }

        return date.toLocaleDateString('en-GB', options);
    };


    //  Pagination
    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    //  Handling search operation according to the input data
    const handleSearch = () => {
        setIsLoading(true);
        const formattedDepartureDate = departureDateFilter ? formatDateInput(departureDateFilter) : '';
        const formattedReturningDate = returningDateFilter ? formatDateInput(returningDateFilter) : '';

        const filtered = flights.filter(flight => {
            const flightDepartureDate = formatDateInput(new Date(flight.departureDate));
            const flightReturningDate = flight.returningDate ? formatDateInput(new Date(flight.returningDate)) : null;

            const departureAirportMatch = !departureAirportFilter ||
                flight.departureAirport.toLowerCase().includes(departureAirportFilter.toLowerCase());

            const arrivalAirportMatch = !arrivalAirportFilter ||
                flight.arrivalAirport.toLowerCase().includes(arrivalAirportFilter.toLowerCase());

            return (
                departureAirportMatch &&
                arrivalAirportMatch &&
                (departureDateFilter ? flightDepartureDate === formattedDepartureDate : true) &&
                ((returningDateFilter && !isOneWay) ? (flightReturningDate && flightReturningDate === formattedReturningDate) : true) &&
                (isOneWay ? flight.oneWay : true)
            );
        });

        setTimeout(() => {
            setFilteredFlights(filtered);
            setIsLoading(false);
            scrollDown();
        }, 500);
    };


    /*  
    Following functions: 
    [handleDepartureSort, handleReturnSort, 
    handlePriceSort, handleDurationSort] 
    are sorting functions.
    */

    const handleDepartureSort = () => {
        const sortedFlights = [...filteredFlights];

        sortedFlights.sort((a, b) => {
            const dateA = new Date(a.departureDate);
            const dateB = new Date(b.departureDate);

            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredFlights(sortedFlights);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleReturnSort = () => {
        const sortedFlights = [...filteredFlights];

        sortedFlights.sort((a, b) => {
            const dateA = a.returningDate ? new Date(a.returningDate) : null;
            const dateB = b.returningDate ? new Date(b.returningDate) : null;

            if (dateA && dateB) {
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (dateA === null && dateB === null) {
                return 0; // Both dates are null
            } else if (dateA === null) {
                return 1; // Null dates go to the bottom
            } else {
                return -1; // Null dates go to the bottom
            }
        });

        setFilteredFlights(sortedFlights);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };


    const handlePriceSort = () => {
        const sortedFlights = [...filteredFlights];

        sortedFlights.sort((a, b) => {
            const priceA = parseFloat(a.price);
            const priceB = parseFloat(b.price);

            if (!isNaN(priceA) && !isNaN(priceB)) {
                return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
            } else if (!isNaN(priceA)) {
                return sortOrder === 'asc' ? 1 : -1; // Non-null price goes to the top
            } else if (!isNaN(priceB)) {
                return sortOrder === 'asc' ? -1 : 1; // Non-null price goes to the top
            } else {
                return 0; // Both prices are NaN
            }
        });

        setFilteredFlights(sortedFlights);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };



    const handleDurationSort = () => {
        const sortedFlights = [...filteredFlights];

        sortedFlights.sort((a, b) => {
            const durationA = parseDuration(a.duration);
            const durationB = parseDuration(b.duration);

            return sortOrder === 'asc' ? durationA - durationB : durationB - durationA;
        });

        setFilteredFlights(sortedFlights);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    /*  
    Handling the duration data coming from json 
    as it's currently coming like 
    this: "2 hours, 5 minutes" */

    const parseDuration = (duration) => {
        const [hours, minutes] = duration.split(' hours ')[0].split(' hours, ');
        return parseInt(hours) * 60 + parseInt(minutes);
    };


    /*  
    Handling changes and setting values 
    from both departure and arrival airports. 
    */
    const handleDepartureChange = (event, newValue) => {
        if (newValue) {
            setDepartureAirportFilter(newValue.name);
            console.log(newValue.name);
        } else {
            // Handle the case when Autocomplete is cleared
            setDepartureAirportFilter('');
            console.log('Autocomplete cleared');
        }
    };

    const handleArrivalChange = (event, newValue) => {
        if (newValue) {
            setArrivalAirportFilter(newValue.name);
            console.log(newValue.name);
        } else {
            // Handle the case when Autocomplete is cleared
            setArrivalAirportFilter('');
            console.log('Autocomplete cleared');
        }
    };


    /*
    Limitting the dropdown items of the autocomplete inputs, 
    also making it search for name, code, and city.
    */
    const filterOptions = (options, { inputValue }) => {
        const input = inputValue.trim().toLowerCase();

        const filteredOptions = options.filter((option) => {
            return (
                option.name.toLowerCase().includes(input) ||
                option.code.toLowerCase().includes(input) ||
                option.city.toLowerCase().includes(input)
            );
        });

        // Limit the number of results to a maximum of 10
        return filteredOptions.slice(0, 10);
    };


    //  Search form
    const renderRequestForm = () => {
        return (
            <div className='search_form'>
                <div className='card sm'>
                    <FormControl>
                        <div className='search_form-input'>
                            <Autocomplete
                                key={clearAllInputs}
                                disablePortal
                                id="departureAirportInput"
                                filterOptions={filterOptions}
                                options={airports}
                                getOptionLabel={(option) => option.name ?? option}
                                onChange={handleDepartureChange}
                                freeSolo
                                renderOption={(props, option) => (
                                    <div  {...props}>
                                        {option.name},&nbsp;
                                        City: {option.city},&nbsp;
                                        Code: {option.code}
                                    </div>
                                )}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params}
                                    label="Departure Airport"
                                    onChange={(e) => setDepartureAirportFilter(e.target.value)}
                                    value={departureAirportFilter}
                                    inputProps={{
                                        ...params.inputProps,
                                        onKeyDown: (e) => {
                                            if (e.key === 'Enter') {
                                                e.stopPropagation();
                                            }
                                        },
                                    }}
                                />}
                            />
                        </div>
                    </FormControl>
                    <FormControl>
                        <div className='search_form-input'>
                            <Autocomplete
                                key={clearAllInputs}
                                disablePortal
                                id="departureAirportInput"
                                filterOptions={filterOptions}
                                options={airports}
                                getOptionLabel={(option) => option.name ?? option}
                                onChange={handleArrivalChange}
                                freeSolo
                                renderOption={(props, option) => (
                                    <div  {...props}>
                                        {option.name},&nbsp;
                                        City: {option.city},&nbsp;
                                        Code: {option.code}
                                    </div>
                                )}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params}
                                    label="Arrival Airport"
                                    onChange={(e) => setArrivalAirportFilter(e.target.value)}
                                    value={departureAirportFilter}
                                    inputProps={{
                                        ...params.inputProps,
                                        onKeyDown: (e) => {
                                            if (e.key === 'Enter') {
                                                e.stopPropagation();
                                            }
                                        },
                                    }}
                                />}
                            />
                        </div>
                    </FormControl>
                    <br />
                    <FormControl>
                        <div className='search_form-input'>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    key={clearAllInputs}
                                    label="Select departure date"
                                    selected={departureDateFilter}
                                    onChange={date => setDepartureDateFilter(date)}
                                    dateFormat="dd/MM/yyyy" // Set the date format to "day/month/year"
                                    className='search_form-input'
                                />
                            </LocalizationProvider>
                        </div>
                    </FormControl>
                    {!isOneWay && (
                        <FormControl>
                            <div className='search_form-input'>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        key={clearAllInputs}
                                        label="Select returning date"
                                        selected={returningDateFilter}
                                        onChange={date => setReturningDateFilter(date)}
                                        dateFormat="dd/MM/yyyy" // Set the date format to "day/month/year"
                                    />
                                </LocalizationProvider>
                            </div>
                        </FormControl>
                    )}
                    <br />
                    <FormControl>
                        <FormControlLabel
                            control={<Checkbox checked={isOneWay}
                                onChange={() => setIsOneWay(!isOneWay)}
                            />}
                            label="One Way Flight"
                            key={clearAllInputs}
                        />
                    </FormControl>

                    <div className='search_form-button'>
                        <Button
                            color="primary"
                            disabled={false}
                            size="large"
                            variant="outlined"
                            onClick={handleSearch}
                        >
                            <span>Search Flights</span>
                        </Button>
                        <Button
                            color="error"
                            size="large"
                            variant="outlined"
                            onClick={handleClearAllInputs}
                        >
                            Clear All
                        </Button>
                    </div>
                </div>
            </div>
        );
    }


    //  The result of the search
    const renderRequestResults = () => {
        if (isLoading) {
            return <Loading />;
        }

        if (filteredFlights.length === 0) {
            return <Alert severity="error">No available flights at the moment.</Alert>
        }

        return (
            <div className='card'>
                <div className='search_header'>flights..</div>
                <div className="results_table">
                    <TableContainer>
                        <TableHead>
                            <TableRow>
                                <TableCell>Flight Number</TableCell>
                                <TableCell>Departure Airport</TableCell>
                                <TableCell>Arrival Airport</TableCell>
                                <TableCell>Departure Location</TableCell>
                                <TableCell>Arrival Location</TableCell>
                                <TableCell onClick={handleDepartureSort}>
                                    <TableSortLabel
                                        active={true}
                                        IconComponent={SwapVertIcon}
                                    >
                                        Departure Date
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell onClick={handleReturnSort}>
                                    <TableSortLabel
                                        active={true}
                                        IconComponent={SwapVertIcon}
                                    >
                                        Return Date
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell onClick={handleDurationSort}>
                                    <TableSortLabel
                                        active={true}
                                        IconComponent={SwapVertIcon}
                                    >
                                        Duration
                                    </TableSortLabel>

                                </TableCell>
                                <TableCell onClick={handlePriceSort}>
                                    <TableSortLabel
                                        active={true}
                                        IconComponent={SwapVertIcon}
                                    >
                                        Price, USD

                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Airline </TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {filteredFlights
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(flight => (
                                    <TableRow key={flight.id}>
                                        <TableCell>{flight.flightNumber}</TableCell>
                                        <TableCell>{flight.departureAirport}</TableCell>
                                        <TableCell>{flight.arrivalAirport}</TableCell>
                                        <TableCell>{flight.departureLocation}</TableCell>
                                        <TableCell>{flight.arrivalLocation}</TableCell>
                                        <TableCell>{formatDateOutput(new Date(flight.departureDate))}</TableCell>
                                        <TableCell>{formatDateOutput(flight.returningDate)}</TableCell>
                                        <TableCell>{flight.duration}</TableCell>
                                        <TableCell>{flight.price}</TableCell>
                                        <TableCell>{flight.airline}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>

                        <TablePagination
                            rowsPerPageOptions={rowsPerPageOptions}
                            component="div"
                            count={filteredFlights.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                        />
                    </TableContainer>
                </div>
            </div>
        );
    };

    return (
        <div className='background'>
            <div className='background_container'>
                <div className='logo_container'>
                    <img alt="amadeus_logo" src={defaultLogo} className='logo' />
                </div>
                <div className='search_header'>find your flight..</div>
                {renderRequestForm()}
                {renderRequestResults()}
                <div ref={scrollRef}>
                </div>
            </div>
        </div>
    );
};


export default SearchFlights;

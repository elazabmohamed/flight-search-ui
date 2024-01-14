import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { FormControl, InputLabel, Input, FormControlLabel, Checkbox, Button, FormHelperText } from '@mui/material';


import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Alert from '@mui/material/Alert';

import SwapVertIcon from '@mui/icons-material/SwapVert';


import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';

import airports from '../../Common/Data/airports.json'
import { defaultLogo } from '../../Images/ImageComponents';
import './searchFlights.css'
import Loading from '../../Common/Components/Loading/Loading';
const API_URL = 'http://localhost:3001/flights';






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


    useEffect(() => {
        fetchData();
    }, []);

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
        }, 1000); // Simulating a delay of 1 seconds
    };

    // const handleSearch = () => {
    //     setIsLoading(true);
    //     const formattedDepartureDate = departureDateFilter ? formatDateInput(departureDateFilter) : '';
    //     const formattedReturningDate = returningDateFilter ? formatDateInput(returningDateFilter) : '';

    //     console.log('Selected Dates:', formattedDepartureDate, formattedReturningDate);

    //     const filtered = flights.filter(flight => {
    //         const flightDepartureDate = formatDateInput(new Date(flight.departureDate));
    //         const flightReturningDate = flight.returningDate ? formatDateInput(new Date(flight.returningDate)) : null;
    //         console.log(flight.departureAirport);

    //         return (

    //             flight.departureAirport.toLowerCase().includes(departureAirportFilter.toLowerCase()) &&
    //             flight.arrivalAirport.toLowerCase().includes(arrivalAirportFilter.toLowerCase()) &&
    //             (departureDateFilter ? flightDepartureDate === formattedDepartureDate : true) &&
    //             ((returningDateFilter && !isOneWay) ? (flightReturningDate && flightReturningDate === formattedReturningDate) : true) &&
    //             (isOneWay ? flight.oneWay : true)
    //         );
    //     });

    //     setTimeout(() => {
    //         setFilteredFlights(filtered);
    //         setIsLoading(false); // Set loading to false after the search is complete
    //         scrollDown();

    //     }, 1000);
    // };

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
        }, 1000);
    };





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
            } else if (dateA) {
                return sortOrder === 'asc' ? -1 : 1;
            } else if (dateB) {
                return sortOrder === 'asc' ? 1 : -1;
            } else {
                return 0; // Both dates are null
            }
        });

        setFilteredFlights(sortedFlights);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };


    const handlePriceSort = () => {
        const sortedFlights = [...filteredFlights];

        sortedFlights.sort((a, b) => {
            const dateA = new Date(a.price);
            const dateB = new Date(b.price);

            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
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

    const parseDuration = (duration) => {
        const [hours, minutes] = duration.split(' hours ')[0].split(' hours, ');
        return parseInt(hours) * 60 + parseInt(minutes);
    };



    // const filterOptions = createFilterOptions({
    //     ignoreCase: true,
    //     matchFrom: "start",
    //     limit: 10,
    // });

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


    const renderRequestForm = () => {
        return (
            <div className='search_form'>
                <div className='card sm'>
                    <FormControl>
                        <Autocomplete
                            disablePortal
                            id="departureAirportInput"
                            filterOptions={filterOptions}
                            options={airports}
                            getOptionLabel={(option) => option.name}
                            onChange={handleDepartureChange}
                            freeSolo
                            renderOption={(props, option, state) => (
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
                                onBlur={(e) => e.preventDefault()}
                            />}
                        />

                        {/* <InputLabel htmlFor="departureAirportInput">
                            Departure Airport:
                        </InputLabel>
                        <Input id="departureAirportInput"
                            aria-describedby="my-helper-text"
                            value={departureAirportFilter}
                            onChange={(e) => setDepartureAirportFilter(e.target.value)}
                            className='search_form-input'
                        /> */}
                    </FormControl>
                    <FormControl>
                        <Autocomplete
                            disablePortal
                            id="departureAirportInput"
                            filterOptions={filterOptions}
                            options={airports}
                            getOptionLabel={(option) => option.name}
                            onChange={handleArrivalChange}
                            freeSolo
                            renderOption={(props, option, state) => (
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
                                onBlur={(e) => e.preventDefault()}
                            />}
                        />
                        {/* <InputLabel htmlFor="arrivalAirportInput">
                            Arrival Airport:
                        </InputLabel>
                        <Input id="arrivalAirportInput"
                            aria-describedby="my-helper-text"
                            value={arrivalAirportFilter}
                            onChange={(e) => setArrivalAirportFilter(e.target.value)}
                            className='search_form-input'
                        /> */}
                    </FormControl>
                    <br />

                    <FormControl>
                        <div className='search_form-input'>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
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
                        <FormControlLabel control={<Checkbox checked={isOneWay}
                            onChange={() => setIsOneWay(!isOneWay)} className='search_form-input' />} label="One Way Flight" />
                    </FormControl>

                    <Button
                        color="primary"
                        disabled={false}
                        size="large"
                        variant="outlined"
                        onClick={handleSearch}
                    >
                        <span>Search Flights</span>
                    </Button>
                </div>
            </div>
        );
    }



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

                            {filteredFlights.map(flight => (
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

                        </TableHead>
                    </TableContainer>
                </div>
            </div>
        );
    };

    const scrollRef = useRef(null);
    function scrollDown() {
        scrollRef.current?.scrollIntoView({ top: "200px", block: "start", behavior: 'smooth' });
    }
    return (

        <div className='background'>
            <div className='background_container'>
                <div className='logo_container'>
                    <img src={defaultLogo} className='logo' />
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

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



import airports from '../../Common/Data/airports.json'
import { defaultLogo } from '../../Images/ImageComponents';
import './searchFlights.css'
import Loading from '../../Common/Components/Loading/Loading';
const API_URL = 'http://localhost:3001/flights';






const SearchFlights = () => {
    const [flights, setFlights] = useState([]);
    const [departureAirportFilter, setDepartureAirportFilter] = useState('');
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

    const handleSearch = () => {
        setIsLoading(true);
        const formattedDepartureDate = departureDateFilter ? formatDateInput(departureDateFilter) : '';
        const formattedReturningDate = returningDateFilter ? formatDateInput(returningDateFilter) : '';

        console.log('Selected Dates:', formattedDepartureDate, formattedReturningDate);

        const filtered = flights.filter(flight => {
            const flightDepartureDate = formatDateInput(new Date(flight.departureDate));
            const flightReturningDate = flight.returningDate ? formatDateInput(new Date(flight.returningDate)) : null;

            return (
                flight.departureAirport.toLowerCase().includes(departureAirportFilter.toLowerCase()) &&
                flight.arrivalAirport.toLowerCase().includes(arrivalAirportFilter.toLowerCase()) &&
                (departureDateFilter ? flightDepartureDate === formattedDepartureDate : true) &&
                ((returningDateFilter && !isOneWay) ? (flightReturningDate && flightReturningDate === formattedReturningDate) : true) &&
                (isOneWay ? flight.oneWay : true)
            );
        });

        setTimeout(() => {
            setFilteredFlights(filtered);
            setIsLoading(false); // Set loading to false after the search is complete
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


    const renderRequestForm = () => {
        return (
            <div className='search_form'>
                <FormControl>
                    <InputLabel htmlFor="departureAirportInput">
                        Departure Airport:
                    </InputLabel>
                    <Input id="departureAirportInput"
                        aria-describedby="my-helper-text"
                        value={departureAirportFilter}
                        onChange={(e) => setDepartureAirportFilter(e.target.value)}
                        className='search_form-input'
                    />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="arrivalAirportInput">
                        Arrival Airport:
                    </InputLabel>
                    <Input id="arrivalAirportInput"
                        aria-describedby="my-helper-text"
                        value={arrivalAirportFilter}
                        onChange={(e) => setArrivalAirportFilter(e.target.value)}
                        className='search_form-input'
                    />
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
        );
    }



    const renderRequestResults = () => {

        if (isLoading) {
            return <Loading />;
        }

        if (filteredFlights.length === 0) {
            // return <p>No available flights at the moment.</p>;
            return <Alert severity="error">No available flights at the moment.</Alert>
        }

        return (
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
                                <TableSortLabel>
                                    Departure Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell onClick={handleReturnSort}>Return Date</TableCell>
                            <TableCell onClick={handleDurationSort}>Duration</TableCell>
                            <TableCell onClick={handlePriceSort}>Price in USD</TableCell>
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
        );
    };


    return (
        <div className='background'>
            <div className='background_container'>
                <div className='logo_container'>
                    <img src={defaultLogo} className='logo' />
                </div>
                <div className='search_header'>find your flight..</div>
                {renderRequestForm()}
                {renderRequestResults()}
            </div>
        </div>
    );
};


export default SearchFlights;

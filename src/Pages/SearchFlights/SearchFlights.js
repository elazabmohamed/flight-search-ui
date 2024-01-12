import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete'

import airports from '../../Common/Data/airports.json'
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



    const renderContent = () => {
        if (isLoading) {
            return <p>Loading...</p>;
        }

        if (filteredFlights.length === 0) {
            return <p>No available flights at the moment.</p>;
        }

        return (<table>
            <thead>
                <tr>
                    <th>Flight Number</th>
                    <th>Departure Airport</th>
                    <th>Departure Location</th>
                    <th onClick={handleDepartureSort}>Departure Date</th>
                    <th>Arrival Airport</th>
                    <th>Arrival Location</th>
                    <th onClick={handleReturnSort}>Return Date</th>
                    <th onClick={handleDurationSort}>Duration</th>
                    <th onClick={handlePriceSort}>Price in USD</th>
                    <th>Airline </th>
                </tr>
            </thead>
            <tbody>
                {filteredFlights.map(flight => (
                    <tr key={flight.id}>
                        <td>{flight.flightNumber}</td>
                        <td>{flight.departureAirport}</td>
                        <td>{flight.departureLocation}</td>
                        <td>{formatDateOutput(new Date(flight.departureDate))}</td>
                        <td>{flight.arrivalAirport}</td>
                        <td>{flight.arrivalLocation}</td>
                        <td>{formatDateOutput(flight.returningDate)}</td>
                        <td>{flight.duration}</td>
                        <td>{flight.price}</td>
                        <td>{flight.airline}</td>
                    </tr>
                ))}
            </tbody>
        </table>);

    };



    return (
        <div>
            <label>Departure Airport:</label>
            <input
                type="text"
                placeholder="Enter departure airport..."
                id="departureAirportInput"
                value={departureAirportFilter}
                onChange={(e) => setDepartureAirportFilter(e.target.value)}
            />
            {/* <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={airports}
                getOptionLabel={(option) => option}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Movie" />}
            /> */}
            <br />

            <label>Arrival Airport:</label>
            <input
                type="text"
                placeholder="Enter arrival airport..."
                id="arrivalAirportInput"
                value={arrivalAirportFilter}
                onChange={(e) => setArrivalAirportFilter(e.target.value)}
            />
            <br />

            <label>Departure Date:</label>
            <DatePicker
                placeholderText="Select departure date"
                selected={departureDateFilter}
                onChange={date => setDepartureDateFilter(date)}
                dateFormat="dd/MM/yyyy" // Set the date format to "day/month/year"
            />
            <br />

            <label>
                One Way Flight:
                <input
                    type="checkbox"
                    checked={isOneWay}
                    onChange={() => setIsOneWay(!isOneWay)}
                />
            </label>
            <br />

            {!isOneWay && (
                <>
                    <label>Returning Date:</label>
                    <DatePicker
                        placeholderText="Select returning date"
                        selected={returningDateFilter}
                        onChange={date => setReturningDateFilter(date)}
                        dateFormat="dd/MM/yyyy" // Set the date format to "day/month/year"
                    />
                    <br />
                </>
            )}

            <button onClick={handleSearch}>Search</button>

            {renderContent()}
        </div>
    );
};


export default SearchFlights;

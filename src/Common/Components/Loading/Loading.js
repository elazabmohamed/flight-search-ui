import React from 'react'

import './loading.css'
export default function Loading() {
    return (
        <div className='loading_container'>
            <div className="loader">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <h1>
                Loading...
            </h1>
        </div>)
}

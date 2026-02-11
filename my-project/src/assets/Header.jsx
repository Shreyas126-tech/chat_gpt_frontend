import React from "react"
import { Link } from "react-router-dom"

import reactLogo from './react.svg'

function Header() {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={reactLogo} alt="React Logo" style={{ width: '50px', height: '50px' }} />
            </div>
            <nav style={{ padding: '1rem', backgroundColor: '#333', marginBottom: '1rem' }}>
                <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Home</Link>
                <Link to="/about" style={{ color: 'white', marginRight: '1rem' }}>About</Link>
                <Link to="/contact" style={{ color: 'white', marginRight: '1rem' }}>Contact</Link>
                <Link to="/signup" style={{ color: 'white', marginRight: '1rem' }}>Signup</Link>
                <Link to="/login" style={{ color: 'white' }}>Login</Link>
            </nav></div>
    )
}

export default Header


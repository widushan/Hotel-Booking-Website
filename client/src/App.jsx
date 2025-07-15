import React from 'react'
import Navbar from './components/Navbar.jsx'
import { useLocation } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';


const App = () => {

  const isOwnerPath = useLocation().pathname.includes('owner')

  return (

    <div>

      {!isOwnerPath && <Navbar />}

      <div className='min-h-[70vh]'>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>

    </div>

  )

}

export default App
import React from 'react'
import Navbar from './components/Navbar.jsx'
import { useLocation } from 'react-router-dom'


const App = () => {

  const isOwnerPath = useLocation().pathname.includes('owner')

  return (

    <div>

      {!isOwnerPath && <Navbar />}

    </div>

  )

}

export default App
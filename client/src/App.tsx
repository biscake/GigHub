// import { useState } from 'react'
import Navbar from './components/Navbar'
import './styles/App.css'

function App() {
  return (
    <>
      <Navbar />
      <h1>GigHub</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

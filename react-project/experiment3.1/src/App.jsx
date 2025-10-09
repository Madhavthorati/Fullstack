import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ProductCard from './component/ProductCard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Madhav</h1>
      <ProductCard/>
    </>
  )
}

export default App

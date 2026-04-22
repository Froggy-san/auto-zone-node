import { BrowserRouter, Route, Routes } from "react-router"
import Home from "./pages/Home"
import Products from "./pages/Products"
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

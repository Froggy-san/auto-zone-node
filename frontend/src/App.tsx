import { BrowserRouter, Route, Routes } from "react-router"
import Home from "./pages/Home"
import Products from "./pages/Products"
import ProductDetails from "./pages/ProductDetails"
// import Dashboard from "./pages/dashboard/Dashboard"
import Login from "./features/auth/Login"
import Signup from "./features/auth/Signup"
import UserLayout from "./pages/user/UserLayout"
import UserActivity from "./pages/user/UserActivity"
import UserSettings from "./pages/user/UserSettings"
import Garage from "./pages/Garage"
import CarDetails from "./pages/CarDetails"
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* AUTH */}

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/garage" element={<Garage />} />
        <Route path="/garage/:userId" element={<CarDetails />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        <Route path="user/:userId" element={<UserLayout />}>
          <Route index element={<UserActivity />} /> {/* domain.com/user */}
          <Route path="settings" element={<UserSettings />} />{" "}
          {/* domain.com/user/settings */}
        </Route>
        {/* <Route path="dashboard" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="settings" element={<Settings />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App

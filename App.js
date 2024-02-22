import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {jwtDecode} from 'jwt-decode';

function LoginUser(props) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [loggedIn, setLoggedIn] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = 'https://jwt.sulla.hu/login';

    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.status !== 200) {
        toast.error("Hiba a kapcsolatban!");
        return;
      }

      const responseData = response.data;

      if (responseData.token !== "") {
        toast.success("Sikeres azonosítás.");
        localStorage.setItem("token", responseData.token);
        setLoggedIn(true);
      } else {
        toast.error("Hiba az adatokban!");
      }

      console.log(responseData.token);
      console.log(jwtDecode(responseData.token));
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Hiba a kapcsolatban vagy az adatokban!");
    }
  };

  if (loggedIn) {
    return <Navigate to="/termekek" />;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

function TermekForm() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://jwt.sulla.hu/termekek", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Hiba a termékek lekérésekor.");
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Termékek</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <strong>{product.name}</strong> - {product.price} Ft
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginUser />} />
        <Route path="/termekek" element={<TermekForm />} />
      </Routes>
    </Router>
  );
}

export default App;

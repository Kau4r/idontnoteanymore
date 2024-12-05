import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'
import logo from '../assets/logo.jpg';
import { supabase } from '../supabase'

const Login = ({ setToken }) => {
  let navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  console.log(formData)
  function handleChange(event) {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [event.target.name]: event.target.value,
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error
      console.log(data)
      setToken(data)
      navigate('/homepage')

      //   alert('Check your email for verification link')
    } catch (error) {
      alert(error)
    }
  }

  return (
    <div className="Login">
      <img className="image" src={logo} alt="Logo" />
      <form className="form" onSubmit={handleSubmit}>
        <div className="inputcon">
          <div className="gap">
            <input placeholder="Email" name="email" onChange={handleChange} />

            <input
              placeholder="Password"
              name="password"
              type="password"
              onChange={handleChange}
            />
          </div>
          <div className="sign">
            Don't have an account? &nbsp;
            <Link className='color' to="/signup">Sign up</Link>
          </div>
        </div>
        <button className="button" type="submit">
          Login
        </button>
      </form>
    </div>
  )
}

export default Login

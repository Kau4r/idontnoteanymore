import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import logo from '../assets/logo.jpg';
import './Login.css'

const SignUp = () => {
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
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    try {
      await supabase.auth
        .signUp({
          email: formData.email,
          password: formData.password,
        })
        .then(({ error }) => {
          if (error) throw new Error(error)
        })
      alert('Check your email for verification link')
    } catch (error) {
      alert(error)
    }
  }

  return (
    <div className="Login">
      <img className="image" src={logo} alt="Logo" />
      <form className="form" onSubmit={handleSubmit}>
        <input placeholder="Email" name="email" onChange={handleChange} />
        <div className="inputcon">
          <div className="gap">
            <input
              placeholder="Password"
              name="password"
              type="password"
              onChange={handleChange}
            />

            <input
              placeholder="Confirm Password" // Changed placeholder for clarity
              name="confirmPassword" // New name for confirm password
              type="password"
              onChange={handleChange}
            />
          </div>

          <div className="sign">
            Don't have an account? &nbsp;
            <Link className='color' to="/">Log in</Link>
          </div>
        </div>
        <button className="button" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  )
}

export default SignUp

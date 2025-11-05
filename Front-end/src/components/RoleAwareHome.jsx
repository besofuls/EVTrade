import React from 'react'
import Home from '../pages/Home'

const RoleAwareHome = () => {
  const userStr = localStorage.getItem('user') || localStorage.getItem('userData')
 
  return <Home />
}

export default RoleAwareHome



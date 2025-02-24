import React from 'react'

interface DashboardContentProps {
  children: React.ReactNode
}

const DashboardContent: React.FC<DashboardContentProps> = ({ children }) => {
  return <div>{children}</div>
}

export default DashboardContent

import { useState, useEffect } from 'react';
import { User, Company } from '@/types';

// Hook để quản lý authentication state cho cả User và Company
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'user' | 'company' | null>(null);

  useEffect(() => {
    // Lấy thông tin từ localStorage khi component mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');
    const storedUserType = localStorage.getItem('userType');
    
    if (storedToken) {
      setToken(storedToken);
      setUserType(storedUserType as 'user' | 'company');
      
      if (storedUser && storedUserType === 'user') {
        setUser(JSON.parse(storedUser));
      } else if (storedCompany && storedUserType === 'company') {
        setCompany(JSON.parse(storedCompany));
      }
    }
    
    setLoading(false);
  }, []);

  const loginUser = (userData: User, authToken: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', 'user');
    localStorage.removeItem('company'); // Clear company data if exists
    
    setUser(userData);
    setCompany(null);
    setToken(authToken);
    setUserType('user');
  };

  const loginCompany = (companyData: Company, authToken: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('company', JSON.stringify(companyData));
    localStorage.setItem('userType', 'company');
    localStorage.removeItem('user'); // Clear user data if exists
    
    setCompany(companyData);
    setUser(null);
    setToken(authToken);
    setUserType('company');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('userType');
    
    setUser(null);
    setCompany(null);
    setToken(null);
    setUserType(null);
  };

  const updateUserProfile = (updatedUser: User) => {
    if (userType === 'user') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const updateCompanyProfile = (updatedCompany: Company) => {
    if (userType === 'company') {
      localStorage.setItem('company', JSON.stringify(updatedCompany));
      setCompany(updatedCompany);
    }
  };

  const isAuthenticated = !!token && (!!user || !!company);
  const isUser = userType === 'user' && !!user;
  const isCompany = userType === 'company' && !!company;

  return {
    user,
    company,
    token,
    userType,
    loading,
    isAuthenticated,
    isUser,
    isCompany,
    loginUser,
    loginCompany,
    logout,
    updateUserProfile,
    updateCompanyProfile,
  };
};

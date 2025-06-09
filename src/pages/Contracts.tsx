import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ContractCardView from '../components/User/ContractCardView';

export default function Contracts() {
  const { isAdmin } = useAuth();

  // For users, show the card view
  if (!isAdmin) {
    return <ContractCardView />;
  }

  // For admins, redirect to admin dashboard contracts section
  return <ContractCardView />;
}
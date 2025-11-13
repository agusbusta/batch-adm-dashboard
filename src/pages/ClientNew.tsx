import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { clientsApi } from '../services/api';
import type { Client } from '../types';
import Button from '../components/Button';
import ClientForm from '../components/ClientForm';
import LoadingSpinner from '../components/LoadingSpinner';

const ClientNew = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsSaving(true);
      if (API_CONFIG.useMockData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, we'd get the created client ID from the API
        const mockId = `client-${Date.now()}`;
        navigate(`/clients/${mockId}`);
      } else {
        const response = await clientsApi.create(data);
        navigate(`/clients/${response.data.id}`);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create client');
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return <LoadingSpinner size="lg" text="Creating client..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Create New Client</h1>
          <p className="text-xs text-gray-500 mt-1">Add a new client to the system</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/clients')}>
          Cancel
        </Button>
      </div>

      {/* Form */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <ClientForm
          onSubmit={handleCreate}
          onCancel={() => navigate('/clients')}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

export default ClientNew;


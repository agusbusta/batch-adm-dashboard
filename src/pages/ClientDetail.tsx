import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getMockClients, getMockJobs, getMockCredits, generateMockTransactions } from '../services/mockData';
import { clientsApi, creditsApi } from '../services/api';
import type { Client, Job, Credit, CreditTransaction } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import ClientForm from '../components/ClientForm';
import MASVConfigViewer from '../components/MASVConfigViewer';
import ClientJobsList from '../components/ClientJobsList';
import CreditBalance from '../components/CreditBalance';
import TransactionHistory from '../components/TransactionHistory';
import Modal from '../components/Modal';
import AddCreditsForm from '../components/AddCreditsForm';

type Tab = 'info' | 'jobs' | 'credits';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [client, setClient] = useState<Client | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [credit, setCredit] = useState<Credit | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false);
  const [isSubtractCreditsModalOpen, setIsSubtractCreditsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        let clientData: Client | null = null;
        let jobsData: Job[] = [];
        let creditData: Credit | null = null;
        let transactionsData: CreditTransaction[] = [];

        if (API_CONFIG.useMockData) {
          // Retry logic for mock data (more tolerant in development)
          let retries = 3;
          while (retries > 0) {
            try {
              const clients = await getMockClients();
              clientData = clients.find(c => c.id === id) || null;
              if (clientData) {
                jobsData = await getMockJobs({ client_id: id }).catch(() => []);
                creditData = await getMockCredits(id).catch(() => null);
                transactionsData = generateMockTransactions(id, 20);
                break; // Success, exit retry loop
              } else {
                break; // Client not found, no need to retry
              }
            } catch {
              retries--;
              if (retries === 0) {
                console.warn('Mock data fetch failed after retries');
              } else {
                await new Promise(resolve => setTimeout(resolve, 200));
              }
            }
          }
        } else {
          const [clientRes, jobsRes, creditRes, transactionsRes] = await Promise.all([
            clientsApi.getById(id),
            clientsApi.getJobs(id),
            creditsApi.getBalance(id),
            creditsApi.getTransactions(id),
          ]);
          clientData = clientRes.data;
          jobsData = jobsRes.data;
          creditData = creditRes.data;
          transactionsData = transactionsRes.data;
        }

        if (!clientData) {
          setError('Client not found');
          return;
        }

        setClient(clientData);
        setJobs(jobsData);
        setCredit(creditData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Auto-open edit modal if route is /edit
  useEffect(() => {
    if (location.pathname.includes('/edit') && client && !isEditModalOpen) {
      setIsEditModalOpen(true);
      // Clean up URL by navigating to base client detail
      navigate(`/clients/${id}`, { replace: true });
    }
  }, [location.pathname, client, id, navigate, isEditModalOpen]);

  // Auto-switch to credits tab if route is /credits
  useEffect(() => {
    if (location.pathname.includes('/credits') && client) {
      setActiveTab('credits');
      // Clean up URL by navigating to base client detail
      navigate(`/clients/${id}`, { replace: true });
    }
  }, [location.pathname, client, id, navigate]);

  const handleUpdateClient = async (data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    if (!id) return;

    try {
      setIsSaving(true);
      if (API_CONFIG.useMockData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setClient({ ...client!, ...data });
      } else {
        const response = await clientsApi.update(id, data);
        setClient(response.data);
      }
      setIsEditModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update client';
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCredits = async (amount: number, description?: string) => {
    if (!id) return;

    try {
      setIsSaving(true);
      if (API_CONFIG.useMockData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        const newBalance = (credit?.balance || 0) + amount;
        setCredit({ ...credit!, balance: newBalance, updated_at: new Date().toISOString() });
        setTransactions([
          {
            id: `tx-${Date.now()}`,
            client_id: id,
            amount,
            type: amount > 0 ? 'add' : 'subtract',
            description,
            created_at: new Date().toISOString(),
          },
          ...transactions,
        ]);
      } else {
        await creditsApi.addCredits(id, amount);
        // Refresh credit and transactions
        const [creditRes, transactionsRes] = await Promise.all([
          creditsApi.getBalance(id),
          creditsApi.getTransactions(id),
        ]);
        setCredit(creditRes.data);
        setTransactions(transactionsRes.data);
      }
      setIsAddCreditsModalOpen(false);
      setIsSubtractCreditsModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update credits';
      throw new Error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading client details..." />;
  }

  if (error || !client) {
    return (
      <div>
        <Alert variant="error" title="Error" onClose={() => navigate('/clients')}>
          {error || 'Client not found'}
        </Alert>
        <div className="mt-4">
          <Button variant="primary" onClick={() => navigate('/clients')}>
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
            ← Back to Clients
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
            <p className="text-xs text-gray-500 mt-1">Client ID: {client.id}</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setIsEditModalOpen(true)}>
          Edit Client
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Information
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'credits'
                ? 'border-slate-700 text-slate-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Credits
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-white rounded border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </label>
                <p className="text-sm text-gray-900 mt-1">{client.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </label>
                <p className="text-sm text-gray-900 mt-1">{client.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(client.created_at)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(client.updated_at)}</p>
              </div>
            </div>
          </div>

          <MASVConfigViewer config={client.masv_portal_config} />
        </div>
      )}

      {activeTab === 'jobs' && (
        <div>
          <ClientJobsList jobs={jobs} loading={false} />
        </div>
      )}

      {activeTab === 'credits' && (
        <div className="space-y-6">
          <CreditBalance balance={credit?.balance || 0} threshold={100} />

          <div className="flex space-x-3">
            <Button variant="primary" onClick={() => setIsAddCreditsModalOpen(true)}>
              Add Credits
            </Button>
            <Button variant="danger" onClick={() => setIsSubtractCreditsModalOpen(true)}>
              Subtract Credits
            </Button>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">Transaction History</h2>
            <TransactionHistory transactions={transactions} loading={false} />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        size="md"
      >
        <ClientForm
          client={client}
          onSubmit={handleUpdateClient}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Add Credits Modal */}
      <Modal
        isOpen={isAddCreditsModalOpen}
        onClose={() => setIsAddCreditsModalOpen(false)}
        title="Add Credits"
        size="md"
      >
        <AddCreditsForm
          mode="add"
          onSubmit={handleAddCredits}
          onCancel={() => setIsAddCreditsModalOpen(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Subtract Credits Modal */}
      <Modal
        isOpen={isSubtractCreditsModalOpen}
        onClose={() => setIsSubtractCreditsModalOpen(false)}
        title="Subtract Credits"
        size="md"
      >
        <AddCreditsForm
          mode="subtract"
          onSubmit={handleAddCredits}
          onCancel={() => setIsSubtractCreditsModalOpen(false)}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
};

export default ClientDetail;


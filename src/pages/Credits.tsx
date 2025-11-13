import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getMockClients, getMockCredits } from '../services/mockData';
import { clientsApi, creditsApi } from '../services/api';
import type { Client, Credit } from '../types';
import Table from '../components/Table';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Alert from '../components/Alert';
import Button from '../components/Button';

const Credits = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [credits, setCredits] = useState<Record<string, Credit>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let clientsData: Client[] = [];
        let creditsData: Credit[] = [];

        if (API_CONFIG.useMockData) {
          clientsData = await getMockClients();
          
          // Fetch credits for all clients (handle individual errors)
          const creditsPromises = clientsData.map(client =>
            getMockCredits(client.id).catch(() => null)
          );
          const creditsResults = await Promise.all(creditsPromises);
          creditsData = creditsResults.filter(c => c !== null) as Credit[];
        } else {
          const clientsRes = await clientsApi.getAll();
          clientsData = clientsRes.data;

          // Fetch credits for all clients
          const creditsPromises = clientsData.map(client =>
            creditsApi.getBalance(client.id).catch(() => null)
          );
          const creditsResults = await Promise.all(creditsPromises);
          creditsData = creditsResults.filter(c => c !== null).map(c => c!.data);
        }

        // Create credits map
        const creditsMap: Record<string, Credit> = {};
        creditsData.forEach(credit => {
          creditsMap[credit.client_id] = credit;
        });
        setCredits(creditsMap);

        setClients(clientsData);
      } catch (err) {
        console.error('Error fetching credits data:', err);
        setError('Failed to load credits');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter clients
  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.id.toLowerCase().includes(query)
    );
  });

  // Sort by credit balance (highest first)
  const sortedClients = [...filteredClients].sort((a, b) => {
    const balanceA = credits[a.id]?.balance || 0;
    const balanceB = credits[b.id]?.balance || 0;
    return balanceB - balanceA;
  });

  // Pagination
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalCredits = () => {
    return Object.values(credits).reduce((sum, credit) => sum + credit.balance, 0);
  };

  const columns = [
    {
      key: 'name',
      label: 'CLIENT',
      sortable: false,
      defaultWidth: 200,
      minWidth: 150,
      render: (client: Client) => (
        <div>
          <div className="font-medium text-gray-900">{client.name}</div>
          <div className="text-xs text-gray-500">{client.email}</div>
        </div>
      ),
    },
    {
      key: 'balance',
      label: 'BALANCE',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (client: Client) => {
        const balance = credits[client.id]?.balance || 0;
        const isLow = balance < 100;
        return (
          <div className={`font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(balance)}
            {isLow && (
              <span className="ml-2 text-xs text-red-500">⚠️ Low</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      sortable: false,
      defaultWidth: 150,
      minWidth: 120,
      render: (client: Client) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/clients/${client.id}/credits`)}
        >
          Manage
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading credits..." />;
  }

  if (error) {
    return (
      <Alert variant="error" title="Error" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Credits Management</h1>
          <p className="text-xs text-gray-500 mt-1">Monitor and manage client credit balances</p>
        </div>
        <div className="flex items-center space-x-3">
          {API_CONFIG.useMockData && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
              Development Mode
            </span>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Credits
            </label>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {formatCurrency(getTotalCredits())}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Clients
            </label>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {clients.length}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Low Balance Clients
            </label>
            <p className="text-2xl font-semibold text-red-600 mt-1">
              {Object.values(credits).filter(c => c.balance < 100).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <SearchBar
            placeholder="Search by client name, email, or ID..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {sortedClients.length} of {clients.length} clients
      </div>

      {/* Table */}
      {sortedClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Try adjusting your search"
        />
      ) : (
        <>
          <div className="bg-white rounded border border-gray-200 overflow-hidden w-full">
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedClients}
                className="w-full"
              />
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={sortedClients.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Credits;


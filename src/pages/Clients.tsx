import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { getMockClients, getMockJobs, getMockCredits } from '../services/mockData';
import { clientsApi, jobsApi, creditsApi } from '../services/api';
import type { Client, Job, Credit } from '../types';
import Table from '../components/Table';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Alert from '../components/Alert';

type SortKey = 'name' | 'email' | 'credits' | 'jobs' | 'created_at';
type SortDirection = 'asc' | 'desc';

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [credits, setCredits] = useState<Record<string, Credit>>({});
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let clientsData: Client[] = [];
        let jobsData: Job[] = [];
        let creditsData: Credit[] = [];

        if (API_CONFIG.useMockData) {
          clientsData = await getMockClients();
          jobsData = await getMockJobs();
          
          // Fetch credits for all clients (handle individual errors)
          const creditsPromises = clientsData.map(client =>
            getMockCredits(client.id).catch(() => null)
          );
          const creditsResults = await Promise.all(creditsPromises);
          creditsData = creditsResults.filter(c => c !== null) as Credit[];
        } else {
          const [clientsRes, jobsRes] = await Promise.all([
            clientsApi.getAll(),
            jobsApi.getAll(),
          ]);
          clientsData = clientsRes.data;
          jobsData = jobsRes.data;

          // Fetch credits for all clients
          const creditsPromises = clientsData.map(client =>
            creditsApi.getBalance(client.id).catch(() => null)
          );
          const creditsResults = await Promise.all(creditsPromises);
          creditsData = creditsResults.filter(c => c !== null).map(c => c!.data);
        }

        // Calculate job counts per client
        const counts: Record<string, number> = {};
        jobsData.forEach(job => {
          counts[job.client_id] = (counts[job.client_id] || 0) + 1;
        });
        setJobCounts(counts);

        // Create credits map
        const creditsMap: Record<string, Credit> = {};
        creditsData.forEach(credit => {
          creditsMap[credit.client_id] = credit;
        });
        setCredits(creditsMap);

        setClients(clientsData);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'credits':
          aValue = credits[a.id]?.balance || 0;
          bValue = credits[b.id]?.balance || 0;
          break;
        case 'jobs':
          aValue = jobCounts[a.id] || 0;
          bValue = jobCounts[b.id] || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key as SortKey);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'name',
      label: 'NAME',
      sortable: true,
      defaultWidth: 200,
      minWidth: 150,
      render: (client: Client) => (
        <div>
          <div className="font-medium text-gray-900">{client.name}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'EMAIL',
      sortable: true,
      defaultWidth: 250,
      minWidth: 200,
      render: (client: Client) => (
        <div className="text-gray-600">{client.email}</div>
      ),
    },
    {
      key: 'credits',
      label: 'CREDITS',
      sortable: true,
      defaultWidth: 150,
      minWidth: 120,
      render: (client: Client) => {
        const balance = credits[client.id]?.balance || 0;
        return (
          <div className="font-medium text-gray-900">
            {formatCurrency(balance)}
          </div>
        );
      },
    },
    {
      key: 'jobs',
      label: 'JOBS',
      sortable: true,
      defaultWidth: 100,
      minWidth: 80,
      render: (client: Client) => {
        const count = jobCounts[client.id] || 0;
        return (
          <div className="text-gray-900">{count}</div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'CREATED',
      sortable: true,
      defaultWidth: 150,
      minWidth: 120,
      render: (client: Client) => (
        <div className="text-gray-600 whitespace-nowrap">
          {formatDate(client.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      sortable: false,
      defaultWidth: 200,
      minWidth: 180,
      render: (client: Client) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clients/${client.id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/clients/${client.id}/credits`)}
          >
            Credits
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading clients..." />;
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
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-xs text-gray-500 mt-1">Manage and monitor client accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          {API_CONFIG.useMockData && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
              Development Mode
            </span>
          )}
          <Button
            variant="primary"
            onClick={() => navigate('/clients/new')}
          >
            Create New Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <SearchBar
            placeholder="Search by name or email..."
            onSearch={setSearchQuery}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      {/* Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Try adjusting your search or create a new client"
          actionLabel="Create New Client"
          onAction={() => navigate('/clients/new')}
        />
      ) : (
        <>
          <div className="bg-white rounded border border-gray-200 overflow-hidden w-full">
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={paginatedClients}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
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
                totalItems={filteredClients.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Clients;


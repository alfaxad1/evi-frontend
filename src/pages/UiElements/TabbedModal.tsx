import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Referee {
  name: string;
  relationship: string;
  phone_number: string;
  id_number: string;
}

interface Collateral {
  item_name: string;
  item_count: number;
  additional_details: string;
}

interface Guarantor {
  name: string;
  id_number: string;
  relationship: string;
  phone_number: string;
  bussiness_location: string;
  residence_details: string;
  pass_photo: string;
  id_photo: string;
  collaterals: Collateral[];
}

interface CustomerData {
  customer: {
    first_name: string;
    last_name: string;
    middle_name?: string;
    phone: string;
    national_id: string;
    occupation: string;
    monthly_income: number;
    passport_photo: string;
    national_id_photo: string;
    date_of_birth: string;
    gender: string;
    address: string;
    county: string;
    business_name?: string;
    business_location?: string;
    residence_details?: string;
  };
  collaterals: Collateral[];
  referees: Referee[];
  guarantors: Guarantor[];
}

interface TabbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Modal: React.ComponentType<any>;
}

const TabbedModal: React.FC<TabbedModalProps> = ({ isOpen, onClose, Modal }) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const customerId = localStorage.getItem("customerId");
  
  const [activeTab, setActiveTab] = useState(0);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'personal', label: 'Personal Details' },
    { id: 'referees', label: 'Referees' },
    { id: 'guarantors', label: 'Guarantors' },
    { id: 'images', label: 'Images' }
  ];

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) {
      setError('No customer ID found');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${apiUrl}/api/customerNew/${customerId}`);
      setCustomerData(response.data);
      console.log("Customer details fetched successfully:", response.data);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setError('Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, customerId]);

  useEffect(() => {
    if (isOpen && !customerData) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerData, fetchCustomerDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-red-600 py-4">
          <p>Error: {error}</p>
          <button 
            onClick={fetchCustomerDetails}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!customerData) {
      return <div className="py-4 text-gray-500 dark:text-gray-400">No data available</div>;
    }

    const currentTab = tabs[activeTab];

    switch (currentTab.id) {
      case 'personal': {
        const { customer } = customerData;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Full Name:</span>
                  <p className="text-gray-900 dark:text-white">
                    {customer.first_name} {customer.middle_name ? customer.middle_name + ' ' : ''}{customer.last_name}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span>
                  <p className="text-gray-900 dark:text-white">{customer.phone}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">National ID:</span>
                  <p className="text-gray-900 dark:text-white">{customer.national_id}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Date of Birth:</span>
                  <p className="text-gray-900 dark:text-white">{formatDate(customer.date_of_birth)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Gender:</span>
                  <p className="text-gray-900 dark:text-white capitalize">{customer.gender}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Occupation:</span>
                  <p className="text-gray-900 dark:text-white">{customer.occupation}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Monthly Income:</span>
                  <p className="text-gray-900 dark:text-white">{formatCurrency(customer.monthly_income)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Address:</span>
                  <p className="text-gray-900 dark:text-white">{customer.address}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">County:</span>
                  <p className="text-gray-900 dark:text-white">{customer.county}</p>
                </div>
                {customer.business_name && (
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Business:</span>
                    <p className="text-gray-900 dark:text-white">{customer.business_name}</p>
                    {customer.business_location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.business_location}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'referees':
        if (!customerData.referees || customerData.referees.length === 0) {
          return <div className="py-4 text-gray-500 dark:text-gray-400">No referees found</div>;
        }
        return (
          <div className="space-y-4">
            {customerData.referees.map((referee, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="font-semibold text-gray-900 dark:text-white">{referee.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-2">
                  <div><span className="font-medium">Relationship:</span> {referee.relationship}</div>
                  <div><span className="font-medium">Phone:</span> {referee.phone_number}</div>
                  <div><span className="font-medium">ID Number:</span> {referee.id_number}</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'guarantors':
        if (!customerData.guarantors || customerData.guarantors.length === 0) {
          return <div className="py-4 text-gray-500 dark:text-gray-400">No guarantors found</div>;
        }
        return (
          <div className="space-y-6">
            {customerData.guarantors.map((guarantor, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="font-semibold text-gray-900 dark:text-white text-lg mb-3">{guarantor.name}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Relationship:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{guarantor.relationship}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{guarantor.phone_number}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">ID Number:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{guarantor.id_number}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Business Location:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{guarantor.bussiness_location}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Residence:</span>
                      <span className="text-gray-900 dark:text-white ml-2">{guarantor.residence_details}</span>
                    </div>
                  </div>
                </div>
                
                {guarantor.collaterals && guarantor.collaterals.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Collaterals:</h4>
                    <div className="space-y-2">
                      {guarantor.collaterals.map((collateral, colIndex) => (
                        <div key={colIndex} className="bg-white dark:bg-gray-700 p-3 rounded border">
                          <div className="text-sm">
                            <span className="font-medium">{collateral.item_name}</span>
                            <span className="text-gray-600 dark:text-gray-300 ml-2">(Qty: {collateral.item_count})</span>
                          </div>
                          {collateral.additional_details && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {collateral.additional_details}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'images':
        { const images = [];
        if (customerData.customer.passport_photo) {
          images.push({ type: 'Passport Photo', url: customerData.customer.passport_photo });
        }
        if (customerData.customer.national_id_photo) {
          images.push({ type: 'National ID Photo', url: customerData.customer.national_id_photo });
        }
        
        // Add guarantor images
        customerData.guarantors?.forEach((guarantor, index) => {
          if (guarantor.pass_photo) {
            images.push({ type: `Guarantor ${index + 1} Passport`, url: guarantor.pass_photo });
          }
          if (guarantor.id_photo) {
            images.push({ type: `Guarantor ${index + 1} ID`, url: guarantor.id_photo });
          }
        });

        if (images.length === 0) {
          return <div className="py-4 text-gray-500 dark:text-gray-400">No images found</div>;
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="text-center">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.type}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Image+Not+Found';
                    }}
                  />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{image.type}</div>
              </div>
            ))}
          </div>
        ); }

      default:
        return <div className="py-4 text-gray-500 dark:text-gray-400">Content not available</div>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 p-4 lg:p-11">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <ul className="flex flex-wrap -mb-px">
            {tabs.map((tab, index) => (
              <li key={tab.id} className="mr-2">
                <button
                  onClick={() => setActiveTab(index)}
                  className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors ${
                    activeTab === index
                      ? 'border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500'
                      : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
};

export default TabbedModal;
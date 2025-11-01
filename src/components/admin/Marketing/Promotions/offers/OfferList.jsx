import React, { useState } from 'react';
import { Edit, Trash2, ToggleLeft, ToggleRight, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const OfferList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data - in real app, this would come from API
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: 'Summer Sale 20% Off',
      type: 'Percentage',
      description: 'Get 20% off on all summer items',
      discountValue: 20,
      validFrom: '2024-01-15',
      validTo: '2024-02-15',
      createdBy: 'Admin',
      isActive: true,
      applicableLevel: 'Restaurant',
      usageLimit: 1000,
      usedCount: 245
    },
    {
      id: 2,
      title: 'Flat ₹100 Off',
      type: 'Flat',
      description: 'Flat ₹100 off on orders above ₹500',
      discountValue: 100,
      validFrom: '2024-01-10',
      validTo: '2024-03-10',
      createdBy: 'Restaurant Owner',
      isActive: true,
      applicableLevel: 'Product',
      usageLimit: 500,
      usedCount: 78
    },
    {
      id: 3,
      title: 'Buy 2 Get 1 Free Pizza',
      type: 'BOGO',
      description: 'Buy 2 pizzas and get 1 free',
      validFrom: '2024-01-20',
      validTo: '2024-02-20',
      createdBy: 'Admin',
      isActive: false,
      applicableLevel: 'Product',
      usageLimit: 200,
      usedCount: 156
    }
  ]);

  const toggleOfferStatus = (id) => {
    setOffers(offers.map(offer => 
      offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
    ));
  };

  const deleteOffer = (id) => {
    setOffers(offers.filter(offer => offer.id !== id));
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || offer.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'Flat': return 'bg-blue-100 text-blue-800';
      case 'Percentage': return 'bg-green-100 text-green-800';
      case 'BOGO': return 'bg-purple-100 text-purple-800';
      case 'Combo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {offers.filter(o => o.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {offers.reduce((sum, o) => sum + o.usedCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Offers Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'flat' ? 'default' : 'outline'}
                onClick={() => setFilterType('flat')}
              >
                Flat
              </Button>
              <Button
                variant={filterType === 'percentage' ? 'default' : 'outline'}
                onClick={() => setFilterType('percentage')}
              >
                Percentage
              </Button>
              <Button
                variant={filterType === 'bogo' ? 'default' : 'outline'}
                onClick={() => setFilterType('bogo')}
              >
                BOGO
              </Button>
              <Button
                variant={filterType === 'combo' ? 'default' : 'outline'}
                onClick={() => setFilterType('combo')}
              >
                Combo
              </Button>
            </div>
          </div>

          {/* Offers Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-700">Offer Details</th>
                  <th className="text-left p-4 font-medium text-gray-700">Type</th>
                  <th className="text-left p-4 font-medium text-gray-700">Valid Period</th>
                  <th className="text-left p-4 font-medium text-gray-700">Usage</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{offer.title}</div>
                        <div className="text-sm text-gray-500">{offer.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created by: {offer.createdBy}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getTypeColor(offer.type)}>
                        {offer.type}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {offer.applicableLevel}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{new Date(offer.validFrom).toLocaleDateString()}</div>
                        <div className="text-gray-500">to</div>
                        <div>{new Date(offer.validTo).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>{offer.usedCount} / {offer.usageLimit}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(offer.usedCount / offer.usageLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={offer.isActive}
                          onCheckedChange={() => toggleOfferStatus(offer.id)}
                        />
                        <span className={`text-sm ${offer.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteOffer(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOffers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No offers found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferList;
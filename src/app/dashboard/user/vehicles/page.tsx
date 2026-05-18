'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, Car, Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';

function VehicleSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col">
      <Skeleton className="h-48 w-full" />
      <CardHeader className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchVehicles = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/user/vehicles?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setVehicles(data.data);
      }
    } catch (error) {
      console.error("Fetch vehicles error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Vehicles</h1>
          <p className="text-muted-foreground mt-1 text-lg">Find the perfect ride for your next adventure.</p>
        </div>
      </header>

      {/* Search and Filter */}
      <Card className="bg-card shadow-lg border-primary/5">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Make, model, or type..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider mb-2 block">Min Price</Label>
              <Input 
                type="number" 
                placeholder="Rs. Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider mb-2 block">Max Price</Label>
              <Input 
                type="number" 
                placeholder="Rs. Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider mb-2 block">Availability From</Label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => fetchVehicles()}
                className="w-full font-bold h-10 rounded-lg shadow-md shadow-primary/10"
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <VehicleSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.length > 0 ? vehicles.map((vehicle: any) => (
            <Card key={vehicle.id} className="group overflow-hidden flex flex-col hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
              <div className="h-56 relative overflow-hidden">
                {vehicle.images && vehicle.images[0] && vehicle.images[0].trim() !== '' ? (
                  <img 
                    src={vehicle.images[0]} 
                    alt={vehicle.make} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-muted text-muted-foreground">
                    <Car className="h-12 w-12 mb-2 opacity-20" />
                    <span className="text-sm font-medium">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground font-bold text-sm px-3 py-1.5 rounded-full shadow-lg border border-border/50">
                  Rs. {vehicle.price_per_day.toLocaleString()}/day
                </div>
              </div>
              
              <CardHeader className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {vehicle.year}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {vehicle.registration_number}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-5 pb-5 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {vehicle.description || "No description provided for this vehicle."}
                </p>
              </CardContent>
              
              <CardFooter className="p-5 border-t bg-muted/5 group-hover:bg-muted/10 transition-colors">
                <Button asChild variant="outline" className="w-full font-bold group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                  <Link href={`/dashboard/user/vehicles/${vehicle.id}`}>
                    View Full Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )) : (
            <div className="col-span-full text-center py-20 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-bold">No vehicles found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              <Button variant="link" onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); setStartDate(''); fetchVehicles(); }}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

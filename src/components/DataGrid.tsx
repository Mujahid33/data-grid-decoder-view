
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ExpandableRow from './ExpandableRow';

interface DataGridProps {
  data: any[];
  headers: string[];
}

type SortDirection = 'asc' | 'desc' | null;

const DataGrid: React.FC<DataGridProps> = ({ data, headers }) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> none
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply global search
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        result = result.filter(row =>
          String(row[column] || '').toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn] || '';
        const bValue = b[sortColumn] || '';
        
        // Try to parse as numbers for proper numeric sorting
        const aNum = parseFloat(String(aValue));
        const bNum = parseFloat(String(bValue));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, columnFilters, sortColumn, sortDirection]);

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setColumnFilters({});
    setSortColumn(null);
    setSortDirection(null);
  };

  const activeFiltersCount = Object.values(columnFilters).filter(Boolean).length + (searchTerm ? 1 : 0);

  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No data to display. Please parse some data first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Data Grid
            <Badge variant="secondary">{filteredAndSortedData.length} rows</Badge>
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
        
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              {/* Column Filters Row */}
              <TableRow>
                <TableHead className="w-8"></TableHead>
                {headers.map((header) => (
                  <TableHead key={`filter-${header}`} className="p-2">
                    <Input
                      placeholder={`Filter ${header}...`}
                      value={columnFilters[header] || ''}
                      onChange={(e) => handleColumnFilter(header, e.target.value)}
                      className="h-8 text-xs"
                    />
                  </TableHead>
                ))}
              </TableRow>
              
              {/* Column Headers Row */}
              <TableRow>
                <TableHead className="w-8"></TableHead>
                {headers.map((header) => (
                  <TableHead
                    key={header}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort(header)}
                  >
                    <div className="flex items-center font-semibold">
                      {header}
                      {getSortIcon(header)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((row, index) => (
                <ExpandableRow
                  key={index}
                  row={row}
                  headers={headers}
                  rowIndex={index}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredAndSortedData.length === 0 && data.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No results found with current filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataGrid;

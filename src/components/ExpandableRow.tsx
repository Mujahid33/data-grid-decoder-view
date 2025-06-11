
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TableCell, TableRow, Table, TableBody, TableHead, TableHeader } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ExpandableRowProps {
  row: any;
  headers: string[];
  rowIndex: number;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ row, headers, rowIndex }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasNestedData = (obj: any): boolean => {
    return Object.values(obj).some(value => 
      value !== null && (typeof value === 'object' || Array.isArray(value))
    );
  };

  const getNestedFields = (obj: any): Record<string, any> => {
    const nested: Record<string, any> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && (typeof value === 'object' || Array.isArray(value))) {
        nested[key] = value;
      }
    });
    
    return nested;
  };

  const renderNestedValue = (value: any): string => {
    if (Array.isArray(value)) {
      return `[${value.length} items]`;
    }
    if (typeof value === 'object' && value !== null) {
      return `{${Object.keys(value).length} fields}`;
    }
    return String(value || '');
  };

  const renderNestedArray = (array: any[], fieldName: string) => {
    if (!Array.isArray(array) || array.length === 0) return null;

    // Check if array contains objects to create a proper table
    const firstItem = array[0];
    if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
      // Get all unique keys from all objects in the array
      const nestedHeaders = new Set<string>();
      array.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => nestedHeaders.add(key));
        }
      });
      
      const headerArray = Array.from(nestedHeaders);

      return (
        <div className="mt-2 border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 text-sm font-medium">
            {fieldName} ({array.length} items)
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {headerArray.map((header) => (
                  <TableHead key={header} className="text-xs font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {array.map((item, index) => (
                <TableRow key={index} className="text-xs">
                  {headerArray.map((header) => (
                    <TableCell key={header} className="py-2 px-3">
                      {Array.isArray(item[header]) ? (
                        <span className="text-muted-foreground">
                          [{item[header].length} items]
                        </span>
                      ) : typeof item[header] === 'object' && item[header] !== null ? (
                        <span className="text-muted-foreground">
                          {JSON.stringify(item[header])}
                        </span>
                      ) : (
                        String(item[header] || '')
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // For simple arrays, show as a list
    return (
      <div className="mt-2">
        <div className="text-sm font-medium mb-2">{fieldName} ({array.length} items):</div>
        <div className="grid gap-1 max-h-32 overflow-y-auto">
          {array.map((item, index) => (
            <div key={index} className="text-xs bg-muted/30 px-2 py-1 rounded">
              {String(item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const originalData = row._originalData || row;
  const showExpandButton = hasNestedData(originalData);
  const nestedFields = getNestedFields(originalData);

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="w-8">
          {showExpandButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </TableCell>
        {headers.map((header) => (
          <TableCell key={header} className="max-w-xs truncate">
            {String(row[header] || '')}
          </TableCell>
        ))}
      </TableRow>
      
      {isExpanded && Object.keys(nestedFields).length > 0 && (
        <TableRow>
          <TableCell></TableCell>
          <TableCell colSpan={headers.length} className="p-4 bg-muted/30">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(nestedFields).map(([fieldName, fieldValue]) => (
                <AccordionItem key={fieldName} value={fieldName}>
                  <AccordionTrigger className="text-sm font-medium">
                    {fieldName} {renderNestedValue(fieldValue)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {Array.isArray(fieldValue) ? (
                        renderNestedArray(fieldValue, fieldName)
                      ) : typeof fieldValue === 'object' && fieldValue !== null ? (
                        <div className="grid gap-2">
                          {Object.entries(fieldValue).map(([subKey, subValue]) => (
                            <div key={subKey} className="flex justify-between py-1 border-b border-muted">
                              <span className="font-medium text-sm">{subKey}:</span>
                              <span className="text-sm text-muted-foreground">
                                {Array.isArray(subValue) ? (
                                  <span>[{subValue.length} items]</span>
                                ) : (
                                  renderNestedValue(subValue)
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {String(fieldValue)}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ExpandableRow;

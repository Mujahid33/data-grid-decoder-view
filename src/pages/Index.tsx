
import React, { useState } from 'react';
import DataParser from '@/components/DataParser';
import DataGrid from '@/components/DataGrid';

const Index = () => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const handleDataParsed = (data: any[], dataHeaders: string[]) => {
    setParsedData(data);
    setHeaders(dataHeaders);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            XML/JSON Data Parser
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Parse and visualize your XML or JSON data with powerful filtering, searching, sorting, and nested object expansion capabilities
          </p>
        </div>

        {/* Data Parser Section */}
        <div className="max-w-4xl mx-auto">
          <DataParser onDataParsed={handleDataParsed} />
        </div>

        {/* Data Grid Section */}
        {parsedData.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <DataGrid data={parsedData} headers={headers} />
          </div>
        )}

        {/* Sample Data Section */}
        {parsedData.length === 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Try Sample Data with Nested Objects</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Sample JSON with nested objects:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`[
  {
    "name": "John Doe",
    "age": 30,
    "contact": {
      "email": "john@example.com",
      "phone": "555-0123"
    },
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    }
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "contact": {
      "email": "jane@example.com",
      "phone": "555-0456"
    },
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "country": "USA"
    }
  }
]`}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Sample XML with nested elements:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`<employees>
  <employee>
    <name>John Doe</name>
    <age>30</age>
    <contact>
      <email>john@example.com</email>
      <phone>555-0123</phone>
    </contact>
    <address>
      <street>123 Main St</street>
      <city>New York</city>
      <country>USA</country>
    </address>
  </employee>
  <employee>
    <name>Jane Smith</name>
    <age>25</age>
    <contact>
      <email>jane@example.com</email>
      <phone>555-0456</phone>
    </contact>
  </employee>
</employees>`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

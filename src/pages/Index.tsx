
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
            Parse and visualize your XML or JSON data with powerful filtering, searching, and sorting capabilities
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
              <h3 className="text-lg font-semibold mb-4">Try Sample Data</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Sample JSON:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`[
  {"name": "John Doe", "age": 30, "city": "New York"},
  {"name": "Jane Smith", "age": 25, "city": "Los Angeles"},
  {"name": "Bob Johnson", "age": 35, "city": "Chicago"}
]`}
                  </pre>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Sample XML:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`<employees>
  <employee>
    <name>John Doe</name>
    <age>30</age>
    <city>New York</city>
  </employee>
  <employee>
    <name>Jane Smith</name>
    <age>25</age>
    <city>Los Angeles</city>
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

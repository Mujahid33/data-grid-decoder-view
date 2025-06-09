import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataParserProps {
  onDataParsed: (data: any[], headers: string[]) => void;
}

const DataParser: React.FC<DataParserProps> = ({ onDataParsed }) => {
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseXML = (xmlString: string): any[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('Invalid XML format');
    }

    const data: any[] = [];
    const rootElement = xmlDoc.documentElement;
    
    // Find repeating elements (likely data rows)
    const childElements = Array.from(rootElement.children);
    
    if (childElements.length === 0) {
      throw new Error('No data found in XML');
    }

    const parseElement = (element: Element): any => {
      const result: any = {};
      
      // Handle child elements
      const children = Array.from(element.children);
      children.forEach((child) => {
        const childElement = child as Element;
        if (childElement.children.length > 0) {
          // Nested element - recursively parse
          result[childElement.tagName] = parseElement(childElement);
        } else {
          // Simple element
          result[childElement.tagName] = childElement.textContent || '';
        }
      });
      
      // If no children, use attributes
      if (Object.keys(result).length === 0) {
        Array.from(element.attributes).forEach((attr) => {
          result[attr.name] = attr.value;
        });
      }
      
      return result;
    };

    childElements.forEach((element) => {
      data.push(parseElement(element as Element));
    });

    return data;
  };

  const parseJSON = (jsonString: string): any[] => {
    const parsed = JSON.parse(jsonString);
    
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      // If it's an object, try to find an array property
      const arrayKeys = Object.keys(parsed).filter(key => Array.isArray(parsed[key]));
      if (arrayKeys.length > 0) {
        return parsed[arrayKeys[0]];
      } else {
        // Convert single object to array
        return [parsed];
      }
    } else {
      throw new Error('JSON must contain an array or object with array properties');
    }
  };

  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          // Nested object - flatten it
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else {
          // Simple value or array
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const extractHeaders = (data: any[]): string[] => {
    if (data.length === 0) return [];
    
    const headers = new Set<string>();
    data.forEach(row => {
      const flattened = flattenObject(row);
      Object.keys(flattened).forEach(key => headers.add(key));
    });
    
    return Array.from(headers);
  };

  const processDataForGrid = (data: any[]): any[] => {
    return data.map(row => {
      const processed = { ...row };
      // Keep original nested structure for expansion
      processed._originalData = row;
      // Add flattened version for main display
      Object.assign(processed, flattenObject(row));
      return processed;
    });
  };

  const handleParse = async (inputData: string) => {
    if (!inputData.trim()) {
      setError('Please provide data to parse');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let parsedData: any[] = [];
      const trimmedData = inputData.trim();

      // Detect format and parse
      if (trimmedData.startsWith('<')) {
        // XML format
        parsedData = parseXML(trimmedData);
      } else if (trimmedData.startsWith('{') || trimmedData.startsWith('[')) {
        // JSON format
        parsedData = parseJSON(trimmedData);
      } else {
        throw new Error('Unrecognized format. Please provide valid XML or JSON data.');
      }

      if (parsedData.length === 0) {
        throw new Error('No data found in the provided input');
      }

      const processedData = processDataForGrid(parsedData);
      const headers = extractHeaders(parsedData);
      onDataParsed(processedData, headers);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleParse(content);
    };
    reader.readAsText(file);
  };

  const handleTextParse = () => {
    handleParse(textInput);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Data Parser
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Paste Data</TabsTrigger>
            <TabsTrigger value="file">Upload File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-input">Paste your XML or JSON data:</Label>
              <Textarea
                id="data-input"
                placeholder="Paste your XML or JSON data here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <Button 
              onClick={handleTextParse} 
              disabled={isLoading || !textInput.trim()}
              className="w-full"
            >
              {isLoading ? 'Parsing...' : 'Parse Data'}
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload XML or JSON file:</Label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">XML or JSON files</p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xml,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataParser;

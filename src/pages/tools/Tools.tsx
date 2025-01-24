import { useState } from 'react';
import { Upload, GitMerge } from 'lucide-react';

type Tool = 'import' | 'merge';
type EntityType = 'hotels' | 'guests' | 'contacts';

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityType | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      // TODO: Process file and use AI for matching
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tools</h1>

      {/* Tool Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => setSelectedTool('import')}
          className={`p-6 rounded-lg border cursor-pointer transition-colors ${
            selectedTool === 'import' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-lg font-semibold">Import Data</h2>
          </div>
          <p className="text-gray-600">
            Import data from CSV files with AI-powered matching to update existing records or create new ones.
          </p>
        </div>

        <div 
          onClick={() => setSelectedTool('merge')}
          className={`p-6 rounded-lg border cursor-pointer transition-colors ${
            selectedTool === 'merge' 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center mb-4">
            <GitMerge className="h-6 w-6 text-indigo-500 mr-2" />
            <h2 className="text-lg font-semibold">Merge Records</h2>
          </div>
          <p className="text-gray-600">
            Merge duplicate records with AI assistance to maintain clean and accurate data.
          </p>
        </div>
      </div>

      {/* Tool Configuration */}
      {selectedTool && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTool === 'import' ? 'Import Configuration' : 'Merge Configuration'}
          </h2>

          {/* Entity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Entity Type
            </label>
            <select
              value={selectedEntity || ''}
              onChange={(e) => setSelectedEntity(e.target.value as EntityType)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select an entity type</option>
              <option value="hotels">Hotels</option>
              <option value="guests">Guests</option>
              <option value="contacts">Contacts</option>
            </select>
          </div>

          {/* Import Tool */}
          {selectedTool === 'import' && selectedEntity && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                disabled={!file}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Start Import
              </button>
            </div>
          )}

          {/* Merge Tool */}
          {selectedTool === 'merge' && selectedEntity && (
            <div>
              <p className="text-gray-600 mb-4">
                Select records to merge and our AI will help identify the best matches and merge strategy.
              </p>
              <button
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Select Records to Merge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
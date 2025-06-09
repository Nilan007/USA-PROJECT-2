import React, { useState } from 'react';
import { Upload, FileText, Users, AlertCircle, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';
import { supabase, parseFileData, validateUploadData, generateTemplateFile, adminUploadContacts, adminUploadContracts } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BulkUploadProps {
  type: 'opportunities' | 'contacts';
  onUploadComplete: () => void;
}

export default function BulkUpload({ type, onUploadComplete }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
        alert('Please select a CSV, XLS, or XLSX file.');
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Parse file data (supports CSV and Excel)
      const parsedData = await parseFileData(file, type);
      console.log('Parsed data:', parsedData.slice(0, 2)); // Log first 2 records for debugging
      
      const { validRecords, errors } = validateUploadData(parsedData, type);
      console.log('Valid records:', validRecords.slice(0, 2)); // Log first 2 valid records
      console.log('Validation errors:', errors);

      let successCount = 0;
      const uploadErrors: string[] = [...errors];

      // Upload valid records using the admin functions
      if (validRecords.length > 0) {
        try {
          if (type === 'contacts') {
            const result = await adminUploadContacts(validRecords);
            successCount = result.success;
            if (result.errors.length > 0) {
              uploadErrors.push(...result.errors);
            }
          } else {
            // For opportunities, we're actually uploading to contracts table
            const result = await adminUploadContracts(validRecords);
            successCount = result.success;
            if (result.errors.length > 0) {
              uploadErrors.push(...result.errors);
            }
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          uploadErrors.push(`Upload error: ${uploadError.message || uploadError}`);
        }
      }

      // Log the upload
      try {
        await supabase.from('upload_logs').insert({
          uploaded_by: user.id,
          file_name: file.name,
          file_type: file.type,
          records_processed: parsedData.length,
          records_successful: successCount,
          records_failed: parsedData.length - successCount,
          error_details: uploadErrors.length > 0 ? { errors: uploadErrors } : null,
          upload_type: type
        });
      } catch (logError) {
        console.error('Error logging upload:', logError);
      }

      setUploadResult({
        success: successCount,
        errors: uploadErrors,
        total: parsedData.length
      });

      if (successCount > 0) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: 0,
        errors: [`File processing error: ${error}`],
        total: 0
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (format: 'csv' | 'excel') => {
    try {
      const template = generateTemplateFile(type, format);
      
      if (format === 'csv') {
        const blob = new Blob([template.content], { type: template.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = template.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([template.content], { type: template.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = template.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating template:', error);
      alert('Error generating template file');
    }
  };

  const getSupportedFormats = () => {
    return [
      { ext: 'CSV', desc: 'Comma-separated values' },
      { ext: 'XLSX', desc: 'Excel 2007+ format' },
      { ext: 'XLS', desc: 'Excel 97-2003 format' }
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {type === 'opportunities' ? (
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
          ) : (
            <Users className="h-6 w-6 text-green-600 mr-2" />
          )}
          <h3 className="text-lg font-medium text-gray-900">
            Bulk Upload {type === 'opportunities' ? 'Contracts' : 'Contacts'}
          </h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => downloadTemplate('csv')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1" />
            CSV Template
          </button>
          <button
            onClick={() => downloadTemplate('excel')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel Template
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File (CSV, XLS, XLSX)
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV, XLS, XLSX files supported</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
            </label>
          </div>
          
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            </div>
          )}
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing {file.name}...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </>
            )}
          </button>
        )}

        {uploadResult && (
          <div className="mt-4 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              {uploadResult.success > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <h4 className="font-medium">Upload Results</h4>
            </div>
            
            <div className="text-sm space-y-1">
              <p>Total records processed: {uploadResult.total}</p>
              <p className="text-green-600">Successfully uploaded: {uploadResult.success}</p>
              {uploadResult.errors.length > 0 && (
                <p className="text-red-600">Failed: {uploadResult.errors.length}</p>
              )}
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-red-800 mb-1">Errors:</h5>
                <div className="max-h-32 overflow-y-auto">
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <p className="text-xs text-red-500 font-medium">
                      ... and {uploadResult.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Supported File Formats:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            {getSupportedFormats().map((format, index) => (
              <div key={index} className="text-xs text-blue-700">
                <span className="font-semibold">{format.ext}:</span> {format.desc}
              </div>
            ))}
          </div>
          
          <h4 className="text-sm font-medium text-blue-800 mb-2">Field Requirements:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            {type === 'opportunities' ? (
              <>
                <li>• <strong>Required:</strong> title, agency</li>
                <li>• <strong>Basic Info:</strong> contract_name, description</li>
                <li>• <strong>Organization:</strong> buying_organization, department, state, contract_type</li>
                <li>• <strong>Organization Levels:</strong> buying_org_level_1, buying_org_level_2, buying_org_level_3</li>
                <li>• <strong>Contract Details:</strong> contract_number, solicitation_number, contractors</li>
                <li>• <strong>Services:</strong> products_services, primary_requirement</li>
                <li>• <strong>Location:</strong> place_of_performance_location</li>
                <li>• <strong>Contact Info:</strong> contact_first_name, contact_phone, contact_email</li>
                <li>• <strong>Financial:</strong> budget_min, budget_max, award_value, naics_code, set_aside_code</li>
                <li>• <strong>Dates:</strong> award_date, start_date, current_expiration_date, ultimate_expiration_date, response_deadline</li>
                <li>• <strong>Status:</strong> status (active/forecast/tracked/closed/cancelled), contract_status (open/awarded/cancelled)</li>
                <li>• <strong>Additional:</strong> source_url, ai_analysis_summary, keywords</li>
                <li>• <strong>Date Format:</strong> YYYY-MM-DD for all date fields</li>
                <li>• <strong>Keywords:</strong> Comma-separated values</li>
                <li>• <strong>Note:</strong> Each contract will receive a unique Federal ID automatically</li>
              </>
            ) : (
              <>
                <li>• <strong>Required:</strong> full_name, title, agency</li>
                <li>• <strong>Optional:</strong> department, state, email, phone</li>
                <li>• <strong>contact_type:</strong> cio, cto, cpo, procurement, director</li>
                <li>• <strong>is_federal:</strong> true/false or 1/0</li>
                <li>• <strong>Email:</strong> Valid email format recommended</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
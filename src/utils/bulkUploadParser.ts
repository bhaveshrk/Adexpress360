import * as XLSX from 'xlsx';
import { Ad, AdCategory, CATEGORIES, CITIES } from '../types';

// Bulk Ad Data structure from CSV/Excel
export interface BulkAdData {
    title: string;
    subject: string;
    description: string;
    phone_number: string;
    category: string;
    city: string;
    location?: string;
    duration_days?: number;
    is_featured?: boolean;
    sub_description?: string;
}

export interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export interface ParseResult {
    data: BulkAdData[];
    errors: ValidationError[];
    totalRows: number;
}

// Valid values for dropdowns
const VALID_CATEGORIES = CATEGORIES.map(c => c.id);
const VALID_DURATIONS = [7, 14, 30, 60, 90, 180, 365];
const VALID_FEATURED = ['yes', 'no', 'true', 'false', '1', '0', ''];

// Parse Excel or CSV file
export async function parseFile(file: File): Promise<ParseResult> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
        return parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
        return parseExcel(file);
    } else {
        throw new Error('Unsupported file format. Please upload a CSV or Excel file.');
    }
}

// Parse CSV file
async function parseCSV(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length < 2) {
                    reject(new Error('CSV file must have headers and at least one data row'));
                    return;
                }

                const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
                const data: BulkAdData[] = [];
                const errors: ValidationError[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    const row = mapToObject(headers, values);
                    const rowErrors = validateRow(row, i + 1);

                    if (rowErrors.length > 0) {
                        errors.push(...rowErrors);
                    } else {
                        data.push(normalizeRow(row));
                    }
                }

                resolve({ data, errors, totalRows: lines.length - 1 });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Parse Excel file using xlsx library
async function parseExcel(file: File): Promise<ParseResult> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                // Get the first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    reject(new Error('Excel file must have at least one data row'));
                    return;
                }

                const data: BulkAdData[] = [];
                const errors: ValidationError[] = [];

                jsonData.forEach((row, index) => {
                    // Normalize keys to lowercase
                    const normalizedRow: Record<string, string> = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase().trim()] = String(row[key]).trim();
                    });

                    const rowErrors = validateRow(normalizedRow, index + 2); // +2 for header row and 1-indexing

                    if (rowErrors.length > 0) {
                        errors.push(...rowErrors);
                    } else {
                        data.push(normalizeRow(normalizedRow));
                    }
                });

                resolve({ data, errors, totalRows: jsonData.length });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

// Parse a single CSV line (handles quoted values)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());

    return result;
}

// Map CSV values to object using headers
function mapToObject(headers: string[], values: string[]): Record<string, string> {
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
        obj[header] = values[index] || '';
    });
    return obj;
}

// Validate a single row
function validateRow(row: Record<string, string>, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields
    if (!row.title?.trim()) {
        errors.push({ row: rowNumber, field: 'title', message: 'Title is required' });
    } else if (row.title.length > 100) {
        errors.push({ row: rowNumber, field: 'title', message: 'Title must be less than 100 characters' });
    }

    if (!row.subject?.trim()) {
        errors.push({ row: rowNumber, field: 'subject', message: 'Subject/Headline is required' });
    } else if (row.subject.length > 150) {
        errors.push({ row: rowNumber, field: 'subject', message: 'Subject must be less than 150 characters' });
    }

    if (!row.description?.trim()) {
        errors.push({ row: rowNumber, field: 'description', message: 'Description is required' });
    }

    // Phone number validation (10 digits starting with 6-9)
    const phone = row.phone_number?.replace(/\D/g, '');
    if (!phone) {
        errors.push({ row: rowNumber, field: 'phone_number', message: 'Phone number is required' });
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
        errors.push({ row: rowNumber, field: 'phone_number', message: 'Invalid phone number (must be 10 digits starting with 6-9)' });
    }

    // Category validation
    const category = row.category?.toLowerCase().trim();
    if (!category) {
        errors.push({ row: rowNumber, field: 'category', message: 'Category is required' });
    } else if (!VALID_CATEGORIES.includes(category as AdCategory)) {
        errors.push({ row: rowNumber, field: 'category', message: `Invalid category. Valid options: ${VALID_CATEGORIES.join(', ')}` });
    }

    // City validation
    if (!row.city?.trim()) {
        errors.push({ row: rowNumber, field: 'city', message: 'City is required' });
    } else if (!CITIES.some(c => c.toLowerCase() === row.city.toLowerCase().trim())) {
        errors.push({ row: rowNumber, field: 'city', message: 'Invalid city name' });
    }

    // Optional: Duration validation
    if (row.duration_days?.trim()) {
        const duration = parseInt(row.duration_days);
        if (isNaN(duration) || !VALID_DURATIONS.includes(duration)) {
            errors.push({ row: rowNumber, field: 'duration_days', message: `Invalid duration. Valid options: ${VALID_DURATIONS.join(', ')} days` });
        }
    }

    // Optional: Featured validation
    if (row.is_featured?.trim()) {
        const featured = row.is_featured.toLowerCase().trim();
        if (!VALID_FEATURED.includes(featured)) {
            errors.push({ row: rowNumber, field: 'is_featured', message: 'Invalid value. Use "yes" or "no"' });
        }
    }

    return errors;
}

// Normalize row data to BulkAdData
function normalizeRow(row: Record<string, string>): BulkAdData {
    const featured = row.is_featured?.toLowerCase().trim();

    return {
        title: row.title.trim(),
        subject: row.subject.trim(),
        description: row.description.trim(),
        phone_number: row.phone_number.replace(/\D/g, ''),
        category: row.category.toLowerCase().trim(),
        city: CITIES.find(c => c.toLowerCase() === row.city.toLowerCase().trim()) || row.city.trim(),
        location: row.location?.trim() || undefined,
        duration_days: row.duration_days ? parseInt(row.duration_days) : 30,
        is_featured: featured === 'yes' || featured === 'true' || featured === '1',
        sub_description: row.sub_description?.trim() || undefined,
    };
}

// Convert validated BulkAdData to Ad objects ready for insertion
export function convertToAds(validatedAds: BulkAdData[]): Omit<Ad, 'id' | 'user_id'>[] {
    const now = new Date();

    return validatedAds.map(ad => ({
        title: ad.title,
        subject: ad.subject,
        description: ad.description,
        sub_description: ad.sub_description,
        phone_number: ad.phone_number,
        category: ad.category as AdCategory,
        city: ad.city,
        location: ad.location,
        created_at: now.toISOString(),
        expires_at: new Date(now.getTime() + (ad.duration_days || 30) * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        views_count: 0,
        calls_count: 0,
        is_featured: ad.is_featured || false,
        approval_status: 'approved' as const,
        approved_at: now.toISOString(),
    }));
}

// Generate Excel template with dropdown validations
export function generateTemplate(): void {
    const wb = XLSX.utils.book_new();

    // Get all Indian cities (flattened from CITIES_BY_STATE in types)
    const VALID_CITIES = [
        'Ahmedabad', 'Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai', 'Pune',
        'Gurgaon', 'Noida', 'Ghaziabad', 'Lucknow', 'Jaipur', 'Chandigarh', 'Bhopal', 'Indore',
        'Nagpur', 'Coimbatore', 'Kochi', 'Thiruvananthapuram', 'Visakhapatnam', 'Mysore',
        'Surat', 'Vadodara', 'Rajkot', 'Patna', 'Ranchi', 'Bhubaneswar', 'Guwahati',
        'Ludhiana', 'Amritsar', 'Agra', 'Varanasi', 'Nashik', 'Aurangabad', 'Jodhpur', 'Udaipur'
    ].sort();

    // Sample data rows with dropdown-compatible values
    const sampleData = [
        {
            title: 'Software Engineer at TechCorp',
            subject: 'Hiring Full Stack Developer',
            description: 'We are looking for experienced developers. Requirements: 3+ years experience, React, Node.js',
            phone_number: '9876543210',
            category: 'jobs',
            city: 'Bangalore',
            location: 'Koramangala',
            duration_days: 30,
            is_featured: 'no',
            sub_description: 'Great opportunity for growth'
        },
        {
            title: '2BHK for Rent',
            subject: 'Fully Furnished Apartment',
            description: 'Spacious 2BHK with modern amenities. Near metro station. Immediate availability.',
            phone_number: '8765432109',
            category: 'rentals',
            city: 'Mumbai',
            location: 'Andheri West',
            duration_days: 60,
            is_featured: 'yes',
            sub_description: ''
        }
    ];

    // Create main data sheet
    const ws = XLSX.utils.json_to_sheet(sampleData, {
        header: ['title', 'subject', 'description', 'phone_number', 'category', 'city', 'location', 'duration_days', 'is_featured', 'sub_description']
    });

    // Set column widths
    ws['!cols'] = [
        { wch: 30 },  // title
        { wch: 30 },  // subject
        { wch: 50 },  // description
        { wch: 15 },  // phone_number
        { wch: 15 },  // category
        { wch: 20 },  // city
        { wch: 20 },  // location
        { wch: 15 },  // duration_days
        { wch: 12 },  // is_featured
        { wch: 30 },  // sub_description
    ];

    // Add data validations (dropdowns) for specific columns
    // Column E = category (index 4), F = city (index 5), H = duration_days (index 7), I = is_featured (index 8)
    // Apply to rows 2-1002 (allowing up to 1000 data rows)
    const dataValidation: { sqref: string; type: string; operator: string; formula1: string; showDropDown?: boolean; allowBlank?: boolean; showErrorMessage?: boolean; errorTitle?: string; error?: string }[] = [];

    // Category dropdown (Column E, rows 2-1002)
    dataValidation.push({
        sqref: 'E2:E1002',
        type: 'list',
        operator: 'equal',
        formula1: `"${VALID_CATEGORIES.join(',')}"`,
        showDropDown: false, // false = show dropdown arrow
        allowBlank: false,
        showErrorMessage: true,
        errorTitle: 'Invalid Category',
        error: 'Please select a valid category from the dropdown'
    });

    // City dropdown (Column F, rows 2-1002)
    dataValidation.push({
        sqref: 'F2:F1002',
        type: 'list',
        operator: 'equal',
        formula1: `"${VALID_CITIES.join(',')}"`,
        showDropDown: false,
        allowBlank: false,
        showErrorMessage: true,
        errorTitle: 'Invalid City',
        error: 'Please select a valid city from the dropdown'
    });

    // Duration dropdown (Column H, rows 2-1002)
    dataValidation.push({
        sqref: 'H2:H1002',
        type: 'list',
        operator: 'equal',
        formula1: `"${VALID_DURATIONS.join(',')}"`,
        showDropDown: false,
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: 'Invalid Duration',
        error: 'Please select a valid duration from the dropdown (7, 14, 30, 60, 90, 180, or 365)'
    });

    // Featured dropdown (Column I, rows 2-1002)
    dataValidation.push({
        sqref: 'I2:I1002',
        type: 'list',
        operator: 'equal',
        formula1: '"yes,no"',
        showDropDown: false,
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: 'Invalid Featured Value',
        error: 'Please select "yes" or "no" from the dropdown'
    });

    // Apply data validations to worksheet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ws as any)['!dataValidation'] = dataValidation;

    XLSX.utils.book_append_sheet(wb, ws, 'Ads');

    // Create a reference sheet with valid values (for user reference)
    const maxRows = Math.max(VALID_CATEGORIES.length, VALID_CITIES.length, VALID_DURATIONS.length, 2);
    const refData = [
        ['Valid Categories', 'Valid Cities', 'Valid Durations (days)', 'Featured Options'],
        ...Array(maxRows).fill(0).map((_, i) => [
            VALID_CATEGORIES[i] || '',
            VALID_CITIES[i] || '',
            VALID_DURATIONS[i]?.toString() || '',
            i === 0 ? 'yes' : (i === 1 ? 'no' : '')
        ])
    ];

    const refWs = XLSX.utils.aoa_to_sheet(refData);
    refWs['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, refWs, 'Valid Values');

    // Create instructions sheet
    const instructions = [
        ['Bulk Ad Upload Template - Instructions'],
        [''],
        ['DROPDOWN FIELDS (Click cells to see options):'],
        ['  • category (Column E) - Select from dropdown: jobs, rentals, sales, services, vehicles, matrimonial, general'],
        ['  • city (Column F) - Select from dropdown of major Indian cities'],
        ['  • duration_days (Column H) - Select from dropdown: 7, 14, 30, 60, 90, 180, or 365 days'],
        ['  • is_featured (Column I) - Select from dropdown: yes or no'],
        [''],
        ['Required Fields:'],
        ['  • title - Main ad title (max 100 characters)'],
        ['  • subject - Ad headline (max 150 characters)'],
        ['  • description - Detailed description of the ad'],
        ['  • phone_number - 10-digit Indian mobile number (starting with 6-9)'],
        ['  • category - Select from dropdown'],
        ['  • city - Select from dropdown'],
        [''],
        ['Optional Fields:'],
        ['  • location - Specific locality (e.g., Koramangala, Andheri West)'],
        ['  • duration_days - Select from dropdown (default: 30)'],
        ['  • is_featured - Select from dropdown (default: no)'],
        ['  • sub_description - Additional details'],
        [''],
        ['Notes:'],
        ['  • See the "Valid Values" sheet for reference'],
        ['  • Click on cells in dropdown columns to see the arrow and select values'],
        ['  • All ads will be automatically approved upon upload'],
        ['  • Delete the sample rows before adding your data'],
    ];

    const instrWs = XLSX.utils.aoa_to_sheet(instructions);
    instrWs['!cols'] = [{ wch: 90 }];
    XLSX.utils.book_append_sheet(wb, instrWs, 'Instructions');

    // Download the file using xlsx-style compatible format for better dropdown support
    XLSX.writeFile(wb, 'bulk_ads_template.xlsx', { bookType: 'xlsx' });
}

// Generate error report as CSV download
export function generateErrorReport(errors: ValidationError[]): void {
    if (errors.length === 0) return;

    const headers = ['Row', 'Field', 'Error Message'];
    const rows = errors.map(e => [e.row.toString(), e.field, e.message]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bulk_upload_errors_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Check for duplicates in upload data against existing ads
export interface DuplicateResult {
    duplicates: { uploadIndex: number; existingAdId: string; title: string; phone: string }[];
    cleanData: BulkAdData[];
}

export function checkForDuplicates(
    uploadData: BulkAdData[],
    existingAds: { id: string; title: string; phone_number: string }[]
): DuplicateResult {
    const duplicates: DuplicateResult['duplicates'] = [];
    const cleanData: BulkAdData[] = [];

    // Create a Set of existing ad signatures (title + phone)
    const existingSignatures = new Map(
        existingAds.map(ad => [
            `${ad.title.toLowerCase().trim()}|${ad.phone_number}`,
            ad.id
        ])
    );

    uploadData.forEach((ad, index) => {
        const signature = `${ad.title.toLowerCase().trim()}|${ad.phone_number}`;
        const existingId = existingSignatures.get(signature);

        if (existingId) {
            duplicates.push({
                uploadIndex: index + 2, // +2 for header row and 1-indexing
                existingAdId: existingId,
                title: ad.title,
                phone: ad.phone_number
            });
        } else {
            cleanData.push(ad);
        }
    });

    return { duplicates, cleanData };
}

// Export existing ads to Excel file
export function exportAdsToExcel(ads: {
    title: string;
    subject: string;
    description: string;
    phone_number: string;
    category: string;
    city: string;
    location?: string;
    created_at: string;
    expires_at: string;
    approval_status?: string;
    is_featured?: boolean;
    views_count: number;
    calls_count: number;
}[]): void {
    const wb = XLSX.utils.book_new();

    // Transform ads data for export
    const exportData = ads.map(ad => ({
        title: ad.title,
        subject: ad.subject,
        description: ad.description,
        phone_number: ad.phone_number,
        category: ad.category,
        city: ad.city,
        location: ad.location || '',
        created_at: new Date(ad.created_at).toLocaleDateString('en-IN'),
        expires_at: new Date(ad.expires_at).toLocaleDateString('en-IN'),
        status: ad.approval_status || 'approved',
        is_featured: ad.is_featured ? 'Yes' : 'No',
        views: ad.views_count,
        calls: ad.calls_count
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
        { wch: 30 },  // title
        { wch: 30 },  // subject
        { wch: 50 },  // description
        { wch: 15 },  // phone_number
        { wch: 12 },  // category
        { wch: 15 },  // city
        { wch: 20 },  // location
        { wch: 12 },  // created_at
        { wch: 12 },  // expires_at
        { wch: 10 },  // status
        { wch: 10 },  // is_featured
        { wch: 8 },   // views
        { wch: 8 },   // calls
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ads Export');
    XLSX.writeFile(wb, `ads_export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Upload history types
export interface UploadHistoryItem {
    id: string;
    timestamp: string;
    totalUploaded: number;
    fileName: string;
}

const UPLOAD_HISTORY_KEY = 'adexpress360_bulk_upload_history';

// Save upload to history
export function saveUploadToHistory(fileName: string, count: number): void {
    try {
        const stored = localStorage.getItem(UPLOAD_HISTORY_KEY);
        const history: UploadHistoryItem[] = stored ? JSON.parse(stored) : [];

        history.unshift({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            totalUploaded: count,
            fileName
        });

        // Keep only last 10 uploads
        if (history.length > 10) {
            history.pop();
        }

        localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save upload history:', e);
    }
}

// Get upload history
export function getUploadHistory(): UploadHistoryItem[] {
    try {
        const stored = localStorage.getItem(UPLOAD_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Export leads to CSV format for easy review in Excel/Google Sheets
 */

const fs = require('fs').promises;
const path = require('path');

function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function leadsToCSV(leads) {
  if (leads.length === 0) {
    return 'No leads to export';
  }

  // CSV Headers
  const headers = [
    'Restaurant Name',
    'Phone',
    'Website',
    'Address',
    'City',
    'State',
    'Email',
    'Potential Emails',
    'Qualification Score',
    'Issues',
    'Rating',
    'Total Reviews',
    'On DoorDash',
    'Has Website',
    'Scraped At'
  ];

  // Build CSV rows
  const rows = leads.map(lead => {
    const issues = Array.isArray(lead.issues) ? lead.issues.join('; ') : '';
    const potentialEmails = Array.isArray(lead.potentialEmails) 
      ? lead.potentialEmails.join('; ') 
      : '';
    
    // Check if on DoorDash (from issues)
    const onDoorDash = lead.issues && !lead.issues.includes('not_on_doordash');
    
    return [
      escapeCsvField(lead.name),
      escapeCsvField(lead.phone),
      escapeCsvField(lead.website),
      escapeCsvField(lead.address),
      escapeCsvField(lead.city),
      escapeCsvField(lead.state),
      escapeCsvField(lead.email || ''),
      escapeCsvField(potentialEmails),
      escapeCsvField(lead.qualificationScore || ''),
      escapeCsvField(issues),
      escapeCsvField(lead.rating || ''),
      escapeCsvField(lead.totalRatings || 0),
      escapeCsvField(onDoorDash ? 'Yes' : 'No'),
      escapeCsvField(lead.website ? 'Yes' : 'No'),
      escapeCsvField(lead.scrapedAt || '')
    ];
  });

  // Combine headers and rows
  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ];

  return csvLines.join('\n');
}

async function exportLeadsToCSV(leads, filename = null) {
  const dataDir = path.join(__dirname, '..', 'data');
  await fs.mkdir(dataDir, { recursive: true });

  if (!filename) {
    const timestamp = new Date().toISOString().split('T')[0];
    filename = `qualified-leads-${timestamp}.csv`;
  }

  const filePath = path.join(dataDir, filename);
  const csv = leadsToCSV(leads);
  
  await fs.writeFile(filePath, csv, 'utf8');
  console.log(`💾 Exported ${leads.length} leads to ${filePath}`);
  
  return filePath;
}

module.exports = { exportLeadsToCSV, leadsToCSV };

/**
 * Utility functions for exporting system data to CSV / Excel
 */

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const csvRows: string[] = [];
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
      const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // Create UTF-8 BOM blob for perfect Excel opening
  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

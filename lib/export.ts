export function downloadCSV<T extends Record<string, any>>(data: T[], filename: string) {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    const csvContent = [
        headers.join(","), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle strings with commas or quotes
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                // Format dates if needed, or just return value
                return value;
            }).join(",")
        )
    ].join("\n");

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

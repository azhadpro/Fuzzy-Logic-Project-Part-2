
export const parseCSV = <T>(text: string): T[] => {
  // Split lines and remove empty ones
  const lines = text.trim().split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Extract headers
  const headers = lines[0].split(',').map(h => h.trim());

  // Map rows to objects
  return lines.slice(1).map(line => {
    // Handle potential commas in quoted strings? 
    // For this simple requirement, simple split is usually sufficient as per provided sample data.
    const values = line.split(','); 
    const obj: any = {};
    
    headers.forEach((header, i) => {
      let val = values[i]?.trim();
      
      // Attempt numeric conversion
      if (val && !isNaN(Number(val))) {
        obj[header] = Number(val);
      } else {
        obj[header] = val;
      }
    });
    return obj as T;
  });
};

export function sanitizeString(input: string): string{
    return input.trim().replace(/[<>]/g, '');
  };
  
  export function sanitizeDinerIds(ids: string[]): string[] {
    return ids.map(id => id.trim()).filter(id => id.length > 0);
  };

  export function parseStringArray(data: string | string[]): string[] {
    if (Array.isArray(data)) {
      return data;
    }
    try {
      // todo: just put this here for sqlitre fixing, can change to forced json but will check back later -- todo move to utils.
      const formattedData = data.replace(/'/g, '"');
      return JSON.parse(formattedData);
    } catch (error) {
      console.error(`Failed to parse string array:`, error);
      return []
    }
  }
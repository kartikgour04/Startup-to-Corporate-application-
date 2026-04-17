// Format currency - shows INR for Indian amounts, USD for others
export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return 'N/A';
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency + ' ';
  if (amount >= 10000000) return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `${symbol}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(0)}K`;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
};

export const formatBudget = (budget) => {
  if (!budget?.min) return null;
  const sym = budget.currency === 'USD' ? '$' : budget.currency === 'INR' ? '₹' : '£';
  if (budget.currency === 'INR') {
    return `${formatCurrency(budget.min, 'INR')} – ${formatCurrency(budget.max, 'INR')}`;
  }
  return `${sym}${(budget.min / 1000).toFixed(0)}K – ${sym}${(budget.max / 1000).toFixed(0)}K`;
};

export const formatFunding = (amount, currency = 'USD') => {
  if (!amount) return '$0';
  if (currency === 'INR') return formatCurrency(amount, 'INR');
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
};

// Indian states list for forms
export const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry','Jammu & Kashmir','Ladakh'
];

// Indian cities for autocomplete
export const INDIAN_CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad',
  'Jaipur','Surat','Lucknow','Kanpur','Nagpur','Visakhapatnam','Bhopal','Patna',
  'Ludhiana','Agra','Nashik','Faridabad','Meerut','Rajkot','Varanasi','Srinagar',
  'Aurangabad','Amritsar','Allahabad','Ranchi','Coimbatore','Indore','Guwahati',
  'Noida','Gurugram','Chandigarh','Kochi','Bhubaneswar','Thiruvananthapuram'
];

export const INDIAN_INDUSTRIES = [
  'Technology / IT', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech',
  'E-Commerce', 'Logistics / Supply Chain', 'SaaS', 'AI / ML', 'Cybersecurity',
  'Gaming', 'Media & Entertainment', 'Real Estate', 'Manufacturing', 'FMCG',
  'Pharmaceutical', 'Automotive', 'Retail', 'Telecom', 'Energy', 'Government / GovTech'
];

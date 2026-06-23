/**
 * Major Indian departure airports for the sender flow (India → UAE corridor).
 * Used to power origin city / origin airport autocomplete. IATA code is what the
 * backend stores in `originAirport`.
 */
export interface Airport {
  code: string; // IATA, e.g. DEL
  city: string;
  name: string;
}

export const IN_AIRPORTS: Airport[] = [
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International' },
  { code: 'HBE', city: 'Hyderabad', name: 'Begumpet' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International' },
  { code: 'PNQ', city: 'Pune', name: 'Pune International' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim' },
  { code: 'GOX', city: 'Goa', name: 'Manohar International (Mopa)' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International' },
  { code: 'CCJ', city: 'Kozhikode', name: 'Calicut International' },
  { code: 'CNN', city: 'Kannur', name: 'Kannur International' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh International' },
  { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee International' },
  { code: 'NAG', city: 'Nagpur', name: 'Dr. Babasaheb Ambedkar International' },
  { code: 'IXM', city: 'Madurai', name: 'Madurai' },
  { code: 'TRZ', city: 'Tiruchirappalli', name: 'Tiruchirappalli International' },
  { code: 'IXE', city: 'Mangaluru', name: 'Mangalore International' },
  { code: 'VTZ', city: 'Visakhapatnam', name: 'Visakhapatnam' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan International' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International' },
  { code: 'IDR', city: 'Indore', name: 'Devi Ahilya Bai Holkar' },
  { code: 'SXR', city: 'Srinagar', name: 'Srinagar International' },
  { code: 'IXB', city: 'Bagdogra', name: 'Bagdogra International' },
  { code: 'RPR', city: 'Raipur', name: 'Swami Vivekananda' },
  { code: 'BHO', city: 'Bhopal', name: 'Raja Bhoj' },
  { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International' },
  { code: 'STV', city: 'Surat', name: 'Surat International' },
];

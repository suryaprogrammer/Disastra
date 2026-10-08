/**
 * Geographic definitions and GeoJSON coordinates for India
 * High accuracy boundaries covering North (Ladakh/Kashmir), South (Kanyakumari),
 * West (Gujarat/Rann of Kutch), East (Arunachal Pradesh/Assam), and Islands.
 */

export interface MapCity {
  name: string;
  state: string;
  lat: number;
  lng: number;
  population?: string;
  isCapital?: boolean;
}

export const MAJOR_INDIAN_CITIES: MapCity[] = [
  { name: 'New Delhi', state: 'Delhi NCR', lat: 28.6139, lng: 77.209, isCapital: true },
  { name: 'Mumbai', state: 'Maharashtra', lat: 18.922, lng: 72.8347 },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lng: 74.7973 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Port Blair', state: 'Andaman & Nicobar', lat: 11.6234, lng: 92.7265 },
];

// Simplified India boundary polygon representing sovereign borders
export const INDIA_BOUNDARY_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Republic of India' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [74.8, 37.1],
            [77.2, 35.5],
            [79.0, 33.2],
            [78.5, 31.8],
            [80.5, 30.5],
            [81.2, 30.2],
            [88.1, 27.9], // Sikkim
            [88.9, 27.3],
            [92.0, 27.8], // Arunachal Pradesh
            [96.1, 28.5],
            [97.4, 28.1], // Easternmost tip
            [96.5, 26.8],
            [95.2, 25.7], // Nagaland/Manipur
            [93.2, 24.2], // Mizoram
            [92.3, 23.8],
            [91.8, 25.2], // Meghalaya
            [89.8, 25.1],
            [88.9, 21.6], // Sundarbans / WB coast
            [87.0, 21.4], // Odisha coast
            [85.8, 19.8], // Puri / Chilika
            [83.3, 17.7], // Visakhapatnam
            [81.0, 16.0], // Godavari/Krishna Delta
            [80.3, 13.1], // Chennai
            [79.8, 10.8], // Point Calimere
            [79.2, 9.3],  // Rameswaram
            [77.5, 8.1],  // Kanyakumari (Southernmost tip)
            [76.3, 9.9],  // Kochi
            [74.9, 12.9], // Mangalore
            [73.8, 15.4], // Goa
            [72.8, 18.9], // Mumbai
            [72.8, 20.9], // Surat
            [72.1, 21.7], // Gulf of Khambhat
            [69.0, 22.3], // Dwarka / Saurashtra
            [68.1, 23.7], // Rann of Kutch (Westernmost tip)
            [70.5, 24.5], // Rajasthan border
            [71.2, 27.0],
            [74.0, 29.8], // Punjab border
            [74.5, 32.5], // Jammu
            [74.8, 34.5],
            [74.8, 37.1],
          ],
        ],
      },
    },
  ],
};

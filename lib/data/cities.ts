export const cities = [
  { slug: 'madrid', name: 'Madrid', province: 'Madrid', population: '3.2M' },
  { slug: 'barcelona', name: 'Barcelona', province: 'Barcelona', population: '1.6M' },
  { slug: 'valencia', name: 'Valencia', province: 'Valencia', population: '790K' },
  { slug: 'bilbao', name: 'Bilbao', province: 'Biscay', population: '350K' },
  { slug: 'seville', name: 'Seville', province: 'Seville', population: '690K' },
  { slug: 'malaga', name: 'Malaga', province: 'Malaga', population: '580K' },
  { slug: 'granada', name: 'Granada', province: 'Granada', population: '230K' },
  { slug: 'marbella', name: 'Marbella', province: 'Malaga', population: '150K' },
  { slug: 'fuengirola', name: 'Fuengirola', province: 'Malaga', population: '75K' },
] as const;

export type CitySlug = typeof cities[number]['slug'];

export const isValidCity = (slug: string): slug is CitySlug => {
  return cities.some(c => c.slug === slug);
};

export const getCityBySlug = (slug: string) => {
  return cities.find(c => c.slug === slug);
};

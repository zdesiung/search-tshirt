import type { DeliveryMethod, ShippingRate } from '../types/ecommerce';

export interface UbigeoProvince {
  name: string;
  districts: string[];
}

export interface UbigeoDepartment {
  name: string;
  zoneType: 'LIMA_METRO' | 'CALLAO' | 'PROVINCIA' | 'ZONA_ESPECIAL';
  provinces: UbigeoProvince[];
}

export const PERU_UBIGEO: UbigeoDepartment[] = [
  {
    name: 'Lima',
    zoneType: 'LIMA_METRO',
    provinces: [
      {
        name: 'Lima',
        districts: [
          'Miraflores',
          'San Isidro',
          'Barranco',
          'Santiago de Surco',
          'San Borja',
          'La Molina',
          'Jesús María',
          'Magdalena del Mar',
          'Pueblo Libre',
          'San Miguel',
          'Lince',
          'Chorrillos',
          'Punta Hermosa',
          'San Bartolo',
          'Pucusana',
          'Lurín',
          'Lima Cercado',
          'Los Olivos',
          'San Martín de Porres',
          'San Juan de Lurigancho',
        ],
      },
      {
        name: 'Cañete',
        districts: ['Asia', 'Mala', 'San Vicente de Cañete', 'Cerro Azul', 'Chilca'],
      },
      {
        name: 'Huaral',
        districts: ['Huaral', 'Chancay'],
      },
    ],
  },
  {
    name: 'Callao',
    zoneType: 'CALLAO',
    provinces: [
      {
        name: 'Callao',
        districts: ['Callao', 'Bellavista', 'La Punta', 'La Perla', 'San Miguel', 'Ventanilla'],
      },
    ],
  },
  {
    name: 'Piura',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Talara',
        districts: ['Máncora', 'Los Órganos', 'Pariñas', 'Lobitos'],
      },
      {
        name: 'Piura',
        districts: ['Piura', 'Castilla', 'Catacaos'],
      },
    ],
  },
  {
    name: 'La Libertad',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Trujillo',
        districts: ['Trujillo', 'Huanchaco', 'Víctor Larco Herrera', 'Salaverry'],
      },
    ],
  },
  {
    name: 'Arequipa',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Arequipa',
        districts: ['Arequipa', 'Cayma', 'Yanahuara', 'Cerro Colorado', 'José Luis Bustamante'],
      },
      {
        name: 'Islay',
        districts: ['Mollendo', 'Mejía'],
      },
    ],
  },
  {
    name: 'Ica',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Pisco',
        districts: ['Paracas', 'Pisco', 'San Andrés'],
      },
      {
        name: 'Ica',
        districts: ['Ica', 'La Tinguiña'],
      },
    ],
  },
  {
    name: 'Cusco',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Cusco',
        districts: ['Cusco', 'Wanchaq', 'San Sebastián'],
      },
    ],
  },
  {
    name: 'Lambayeque',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Chiclayo',
        districts: ['Chiclayo', 'Pimentel', 'La Victoria'],
      },
    ],
  },
  {
    name: 'Áncash',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Santa',
        districts: ['Chimbote', 'Nuevo Chimbote'],
      },
      {
        name: 'Huarmey',
        districts: ['Huarmey', 'Tuquillo'],
      },
    ],
  },
  {
    name: 'Tumbes',
    zoneType: 'PROVINCIA',
    provinces: [
      {
        name: 'Contralmirante Villar',
        districts: ['Zorritos', 'Punta Sal', 'Canoas de Punta Sal'],
      },
      {
        name: 'Tumbes',
        districts: ['Tumbes'],
      },
    ],
  },
  {
    name: 'Loreto',
    zoneType: 'ZONA_ESPECIAL',
    provinces: [
      {
        name: 'Maynas',
        districts: ['Iquitos', 'Punchana', 'Belén', 'San Juan Bautista'],
      },
    ],
  },
  {
    name: 'Madre de Dios',
    zoneType: 'ZONA_ESPECIAL',
    provinces: [
      {
        name: 'Tambopata',
        districts: ['Tambopata', 'Puerto Maldonado'],
      },
    ],
  },
];

export const INITIAL_SHIPPING_RATES: ShippingRate[] = [
  {
    id: 'rate-lima-metro',
    zoneType: 'LIMA_METRO',
    department: 'Lima',
    carrier: 'Motorizado Express BEACH POLO',
    deliveryModes: ['domicilio', 'pickup'],
    rate: 15,
    estimatedDays: '24 a 48 horas hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-lima-sur',
    zoneType: 'LIMA_METRO',
    department: 'Lima',
    province: 'Cañete',
    carrier: 'Courier Sur Chico BEACH POLO',
    deliveryModes: ['domicilio', 'agencia'],
    rate: 18,
    estimatedDays: '24 a 48 horas hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-callao',
    zoneType: 'CALLAO',
    department: 'Callao',
    carrier: 'Motorizado Express BEACH POLO',
    deliveryModes: ['domicilio'],
    rate: 18,
    estimatedDays: '24 a 48 horas hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-piura',
    zoneType: 'PROVINCIA',
    department: 'Piura',
    carrier: 'Shalom / Olva Courier',
    deliveryModes: ['domicilio', 'agencia'],
    rate: 22,
    estimatedDays: '2 a 4 días hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-libertad',
    zoneType: 'PROVINCIA',
    department: 'La Libertad',
    carrier: 'Shalom / Olva Courier',
    deliveryModes: ['domicilio', 'agencia'],
    rate: 20,
    estimatedDays: '2 a 3 días hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-arequipa',
    zoneType: 'PROVINCIA',
    department: 'Arequipa',
    carrier: 'Shalom / Olva Courier',
    deliveryModes: ['domicilio', 'agencia'],
    rate: 22,
    estimatedDays: '2 a 4 días hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-ica',
    zoneType: 'PROVINCIA',
    department: 'Ica',
    carrier: 'Shalom / Olva Courier',
    deliveryModes: ['domicilio', 'agencia'],
    rate: 18,
    estimatedDays: '1 a 2 días hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-cusco',
    zoneType: 'PROVINCIA',
    department: 'Cusco',
    carrier: 'Olva Courier / Shalom Aéreo',
    deliveryModes: ['domicilio', 'agencia'],
    rate: 24,
    estimatedDays: '3 a 5 días hábiles',
    isManualQuote: false,
    active: true,
  },
  {
    id: 'rate-loreto',
    zoneType: 'ZONA_ESPECIAL',
    department: 'Loreto',
    carrier: 'Courier Aéreo Amazónico',
    deliveryModes: ['agencia', 'domicilio'],
    rate: 32,
    estimatedDays: '4 a 6 días hábiles',
    isManualQuote: true,
    active: true,
  },
  {
    id: 'rate-madre-dios',
    zoneType: 'ZONA_ESPECIAL',
    department: 'Madre de Dios',
    carrier: 'Courier Aéreo / Olva',
    deliveryModes: ['agencia', 'domicilio'],
    rate: 32,
    estimatedDays: '4 a 6 días hábiles',
    isManualQuote: true,
    active: true,
  },
];

export interface ShippingQuote {
  cost: number;
  zoneLabel: string;
  carrier: string;
  estimatedDays: string;
  isManualQuote: boolean;
  isFree: boolean;
}

export function resolveShippingQuote(
  rates: ShippingRate[],
  params: {
    department: string;
    province: string;
    district: string;
    deliveryMethod: DeliveryMethod;
    subtotal: number;
    freeShippingThreshold: number;
  }
): ShippingQuote {
  if (params.deliveryMethod === 'pickup') {
    return {
      cost: 0,
      zoneLabel: 'Recojo en tienda',
      carrier: 'Showroom Miraflores (Calle Berlín 420)',
      estimatedDays: 'Listo en 24 horas',
      isManualQuote: false,
      isFree: true,
    };
  }

  const activeRates = rates.filter((r) => r.active);
  const matched =
    activeRates.find(
      (r) =>
        r.department === params.department &&
        r.province &&
        r.province === params.province
    ) ||
    activeRates.find((r) => r.department === params.department && !r.province) ||
    activeRates.find((r) => r.department === params.department);

  const deptInfo = PERU_UBIGEO.find((d) => d.name === params.department);
  const zoneType = matched?.zoneType || deptInfo?.zoneType || 'PROVINCIA';
  const baseCost = matched ? matched.rate : zoneType === 'LIMA_METRO' ? 15 : 22;
  const isSpecial = matched?.isManualQuote || zoneType === 'ZONA_ESPECIAL';
  const freeEligible =
    !isSpecial && params.subtotal >= params.freeShippingThreshold;

  const zoneTag =
    zoneType === 'LIMA_METRO'
      ? 'LIMA METRO'
      : zoneType === 'CALLAO'
        ? 'CALLAO'
        : zoneType === 'ZONA_ESPECIAL'
          ? 'ZONA ESPECIAL'
          : 'PROVINCIA';

  return {
    cost: freeEligible ? 0 : baseCost,
    zoneLabel: `${params.district}, ${params.department} (${zoneTag})`,
    carrier:
      params.deliveryMethod === 'agencia'
        ? 'Shalom / Olva Courier (Agencia)'
        : matched?.carrier || 'Shalom / Olva Courier',
    estimatedDays:
      matched?.estimatedDays ||
      (zoneType === 'LIMA_METRO' ? '24 a 48 horas hábiles' : '2 a 4 días hábiles'),
    isManualQuote: isSpecial,
    isFree: freeEligible,
  };
}

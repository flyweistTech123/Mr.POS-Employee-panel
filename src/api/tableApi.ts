/* eslint-disable @typescript-eslint/no-unused-vars */
import api from './axios';

export interface Table {
  id: string;
  number: string;
  floor: string;
  status: TableStatus;
  capacity: number;
  currentOrder?: string;
  waiterName?: string;
  lastUpdated: string;
  position?: {
    x: number;
    y: number;
  };
  timer?: number;
}

export type TableStatus = 'Available' | 'Served' | 'Reserved' | 'Ready' | 'Waiting';

export interface TableFilter {
  floor?: string;
  status?: TableStatus;
  capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
}

export interface TableReservation {
  tableId: string;
  customerName: string;
  customerPhone: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
}

// ---------------- Real API raw shapes ----------------
// Adjust field names here if the backend uses different keys.
interface ApiTable {
  table_id: number;
  table_number?: string;
  number?: string;
  capacity: number;
  status?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  current_order?: string | number | null;
  waiter_name?: string | null;
  last_updated?: string;
  timer?: number;
}

const SIZE_BY_CAPACITY: Record<number, { width: number; height: number }> = {
  2: { width: 120, height: 90 },
  4: { width: 160, height: 110 },
  8: { width: 220, height: 130 },
};

export const dimensionsForCapacity = (capacity: number) =>
  SIZE_BY_CAPACITY[capacity] ?? { width: 160, height: 110 };

const toTable = (t: ApiTable, floor: string): Table => {
  const dims = dimensionsForCapacity(t.capacity);
  return {
    id: String(t.table_id),
    number:
      t.table_number ??
      t.number ??
      `T${String(t.table_id).padStart(2, '0')}`,
    floor,
    status: (t.status as TableStatus) ?? 'Available',
    capacity: t.capacity,
    currentOrder: t.current_order != null ? String(t.current_order) : undefined,
    waiterName: t.waiter_name ?? undefined,
    lastUpdated: t.last_updated ?? new Date().toISOString(),
    position: { x: t.x ?? 0, y: t.y ?? 0 },
    ...(t.timer !== undefined ? { timer: t.timer } : {}),
  };
};

// Get all tables
export const getTables = async (): Promise<Table[]> => {
  return generateDummyTables();
};

// Get table by ID
export const getTableById = async (tableId: string): Promise<Table | null> => {
  const dummyTables = generateDummyTables();
  return dummyTables.find(table => table.id === tableId) || null;
};

// Update table status
export const updateTableStatus = async (
  tableId: string,
  status: TableStatus
): Promise<{ success: boolean; table: Table }> => {
  const dummyTables = generateDummyTables();
  const table = dummyTables.find(t => t.id === tableId);
  if (table) {
    table.status = status;
    table.lastUpdated = new Date().toISOString();
  }
  return { success: true, table: table! };
};

// Reserve table
export const reserveTable = async (): Promise<{
  success: boolean;
  reservationId: string;
}> => {
  return { success: true, reservationId: `RES_${Date.now()}` };
};

// Cancel table reservation
export const cancelTableReservation = async (): Promise<{
  success: boolean;
}> => {
  return { success: true };
};

// Get table availability
export const getTableAvailability = async (params: {
  date: string;
  time: string;
  partySize: number;
  floor?: string;
}): Promise<Table[]> => {
  const dummyTables = generateDummyTables();
  return dummyTables.filter(
    table =>
      table.status === 'Available' && table.capacity >= params.partySize
  );
};

// Get table statistics
export const getTableStatistics = async (): Promise<{
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  maintenance: number;
}> => {
  return {
    total: 20,
    available: 8,
    occupied: 6,
    reserved: 3,
    cleaning: 2,
    maintenance: 1,
  };
};

// ---------------- GET tables for a floor (real API) ----------------
// `floor` must be the numeric floor id as a string, e.g. "5".
// Optional `status` filter maps to ?status=Served|Waiting|Reserved.
export const getTablesByFloor = async (
  floor: string,
  status?: TableStatus
): Promise<Table[]> => {
  try {
    const params = status ? { status } : undefined;
    const { data } = await api.get(
      `/employee/table_booking/floor-plan/${floor}`,
      { params }
    );
    const raw: ApiTable[] = Array.isArray(data)
      ? data
      : data.tables ?? data.data ?? [];
    return raw.map(t => toTable(t, String(floor)));
  } catch (error) {
    console.error('Error fetching tables by floor:', error);
    // Fallback to dummy data filtered by floor
    const dummyTables = generateDummyTables();
    return dummyTables.filter(table => table.floor === floor);
  }
};

// Get floor statistics
export const getFloorStatistics = async (
  floor: string
): Promise<{
  total: number;
  available: number;
  served: number;
  reserved: number;
  ready: number;
  occupancyRate: number;
}> => {
  const dummyTables = generateDummyTables();
  const floorTables = dummyTables.filter(table => table.floor === floor);
  const total = floorTables.length;
  const available = floorTables.filter(t => t.status === 'Available').length;
  const served = floorTables.filter(t => t.status === 'Served').length;
  const reserved = floorTables.filter(t => t.status === 'Reserved').length;
  const ready = floorTables.filter(t => t.status === 'Ready').length;

  return {
    total,
    available,
    served,
    reserved,
    ready,
    occupancyRate:
      total > 0 ? Math.round(((served + reserved) / total) * 100) : 0,
  };
};

// ---------------- GET all floors (real API) ----------------
export const getFloors = async (): Promise<string[]> => {
  try {
    const { data } = await api.get('/employee/table_booking/floors');
    const raw = Array.isArray(data) ? data : data.floors ?? data.data ?? [];
    // Normalize to string ids (component expects strings)
    return raw.map((f: any) =>
      typeof f === 'number' || typeof f === 'string'
        ? String(f)
        : String(f.id ?? f.floor_id)
    );
  } catch (error) {
    console.error('Error fetching floors:', error);
    return ['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06'];
  }
};

// Get floor overview with all floors statistics
export const getFloorOverview = async (): Promise<{
  floors: string[];
  statistics: Record<
    string,
    {
      total: number;
      available: number;
      served: number;
      reserved: number;
      ready: number;
      occupancyRate: number;
    }
  >;
}> => {
  const floors = ['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06'];
  const statistics: Record<
    string,
    {
      total: number;
      available: number;
      served: number;
      reserved: number;
      ready: number;
      occupancyRate: number;
    }
  > = {};

  floors.forEach(floor => {
    const floorTables = generateDummyTables().filter(t => t.floor === floor);
    const total = floorTables.length;
    const available = floorTables.filter(t => t.status === 'Available').length;
    const served = floorTables.filter(t => t.status === 'Served').length;
    const reserved = floorTables.filter(t => t.status === 'Reserved').length;
    const ready = floorTables.filter(t => t.status === 'Ready').length;

    statistics[floor] = {
      total,
      available,
      served,
      reserved,
      ready,
      occupancyRate:
        total > 0 ? Math.round(((served + reserved) / total) * 100) : 0,
    };
  });

  return { floors, statistics };
};

// Get tables by capacity
export const getTablesByCapacity = async (
  capacity: number
): Promise<Table[]> => {
  const dummyTables = generateDummyTables();
  return dummyTables.filter(table => table.capacity === capacity);
};

// Get tables by capacity range
export const getTablesByCapacityRange = async (
  minCapacity: number,
  maxCapacity: number
): Promise<Table[]> => {
  const dummyTables = generateDummyTables();
  return dummyTables.filter(
    table =>
      table.capacity >= minCapacity && table.capacity <= maxCapacity
  );
};

// Get table capacity statistics
export const getTableCapacityStatistics = async (): Promise<{
  capacity2: { total: number; available: number; served: number; reserved: number };
  capacity4: { total: number; available: number; served: number; reserved: number };
  capacity8: { total: number; available: number; served: number; reserved: number };
}> => {
  const dummyTables = generateDummyTables();

  const getCapacityStats = (capacity: number) => {
    const capacityTables = dummyTables.filter(t => t.capacity === capacity);
    const total = capacityTables.length;
    const available = capacityTables.filter(t => t.status === 'Available').length;
    const served = capacityTables.filter(t => t.status === 'Served').length;
    const reserved = capacityTables.filter(t => t.status === 'Reserved').length;
    return { total, available, served, reserved };
  };

  return {
    capacity2: getCapacityStats(2),
    capacity4: getCapacityStats(4),
    capacity8: getCapacityStats(8),
  };
};

// Get available tables for party size
export const getAvailableTablesForParty = async (
  partySize: number,
  floor?: string
): Promise<Table[]> => {
  const dummyTables = generateDummyTables();
  return dummyTables.filter(
    table =>
      table.status === 'Available' &&
      table.capacity >= partySize &&
      (!floor || table.floor === floor)
  );
};

// Get table capacity recommendations for party size
export const getTableCapacityRecommendations = async (
  partySize: number
): Promise<{
  recommended: number[];
  alternative: number[];
  message: string;
}> => {
  let recommended: number[] = [];
  let alternative: number[] = [];
  let message = '';

  if (partySize <= 2) {
    recommended = [2];
    alternative = [4];
    message = '2-person table recommended';
  } else if (partySize <= 4) {
    recommended = [4];
    alternative = [2, 8];
    message = '4-person table recommended';
  } else if (partySize <= 8) {
    recommended = [8];
    alternative = [4];
    message = '8-person table recommended';
  } else {
    recommended = [8];
    alternative = [8];
    message = 'Multiple tables may be needed for larger parties';
  }

  return { recommended, alternative, message };
};

// Helper function to generate dummy tables
const generateDummyTables = (): Table[] => {
  const floors = ['F-01', 'F-02', 'F-03'];
  const statuses: TableStatus[] = [
    'Available',
    'Reserved',
    'Ready',
    'Served',
    'Waiting',
    'Available',
    'Reserved',
    'Ready',
    'Served',
    'Waiting',
  ];
  const capacities = [2, 4, 8, 4, 2, 8];
  const tables: Table[] = [];
  const demoOrderIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let orderIdx = 0;

  floors.forEach((floor, floorIdx) => {
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 5; col++) {
        const num = row * 10 + col;
        const status = statuses[(row * 5 + col + floorIdx) % statuses.length];
        const capacity = capacities[(row * 5 + col + floorIdx) % capacities.length];

        let currentOrder: string | undefined = undefined;
        let timer: number | undefined = undefined;
        if (status !== 'Available' && orderIdx < demoOrderIds.length) {
          currentOrder = demoOrderIds[orderIdx];
          orderIdx++;
        }
        if (status === 'Waiting') {
          timer = Math.floor(Math.random() * 150) + 1;
        }

        tables.push({
          id: `t-${floorIdx + 1}-${num}`,
          number: `T${num}`,
          floor,
          status,
          capacity,
          currentOrder,
          waiterName:
            status !== 'Available'
              ? ['John Doe', 'Jane Smith', 'Mike Johnson'][(row + col) % 3]
              : undefined,
          lastUpdated: new Date(
            Date.now() - Math.random() * 86400000
          ).toISOString(),
          ...(timer !== undefined ? { timer } : {}),
        });
      }
    }
  });
  return tables;
};

// ---------------- PUT layout (real API) ----------------
// Sends the geometry payload the backend expects:
// { tables: [{ table_id, capacity, x, y, width, height, rotation }] }
export const updateFloorPlan = async (
  floor: string,
  tables: Table[]
): Promise<{ success: boolean }> => {
  try {
    const payload = {
      tables: tables.map(t => {
        const dims = dimensionsForCapacity(t.capacity);
        return {
          table_id: Number(t.id),
          capacity: t.capacity,
          x: t.position?.x ?? 0,
          y: t.position?.y ?? 0,
          width: dims.width,
          height: dims.height,
          rotation: 0,
        };
      }),
    };
    await api.put(
      `/employee/table_booking/floor-plan/${floor}/layout`,
      payload
    );
    return { success: true };
  } catch (error) {
    console.error('Error saving floor plan:', error);
    // Keep the dummy behavior on failure so the UI does not break
    console.log(floor, tables);
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }
};
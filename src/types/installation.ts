export interface Inverter {
    id: number;
    name?: string;
    serial_number: string;
  }
  
  export interface Installation {
    id: number;
    name: string;
    station_addr?: string;
    inverters?: Inverter[];
  }
  
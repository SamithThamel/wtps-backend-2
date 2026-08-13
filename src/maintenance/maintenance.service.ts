import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface MaintenanceLog {
  id?: string;
  equipmentName: string;
  maintenanceType: 'Preventive' | 'Breakdown' | 'Calibration';
  description: string;
  technicianName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  cost: number;
  timestamp: string;
}

@Injectable()
export class MaintenanceService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createLog(data: Partial<MaintenanceLog>, user: any): Promise<MaintenanceLog> {
    const docRef = this.firebaseService.db.collection('maintenance_logs').doc();
    const newLog: MaintenanceLog = {
      id: docRef.id,
      equipmentName: data.equipmentName || 'Main Aeration Pump',
      maintenanceType: data.maintenanceType || 'Preventive',
      description: data.description || '',
      technicianName: data.technicianName || user.name || user.email,
      status: data.status || 'Completed',
      cost: Number(data.cost) || 0,
      timestamp: new Date().toISOString(),
    };

    await docRef.set(newLog);
    return newLog;
  }

  async getLogs(): Promise<MaintenanceLog[]> {
    const snapshot = await this.firebaseService.db.collection('maintenance_logs').get();
    const logs: MaintenanceLog[] = [];
    snapshot.forEach((doc) => logs.push(doc.data() as MaintenanceLog));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

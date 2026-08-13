import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface ConsultantLog {
  id?: string;
  topic: string;
  observation: string;
  recommendations: string;
  consultantName: string;
  timestamp: string;
}

@Injectable()
export class ConsultantLogService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createLog(data: Partial<ConsultantLog>, user: any): Promise<ConsultantLog> {
    const docRef = this.firebaseService.db.collection('consultant_logs').doc();
    const newLog: ConsultantLog = {
      id: docRef.id,
      topic: data.topic || 'Process Optimization Audit',
      observation: data.observation || '',
      recommendations: data.recommendations || '',
      consultantName: user.name || user.email,
      timestamp: new Date().toISOString(),
    };

    await docRef.set(newLog);
    return newLog;
  }

  async getLogs(): Promise<ConsultantLog[]> {
    const snapshot = await this.firebaseService.db.collection('consultant_logs').get();
    const logs: ConsultantLog[] = [];
    snapshot.forEach((doc) => logs.push(doc.data() as ConsultantLog));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

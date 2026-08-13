import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface OperatorLog {
  id?: string;
  influentFlowRate: number; // m3/h
  effluentFlowRate: number; // m3/h
  phLevel: number;
  codLevel: number; // mg/L
  bodLevel: number; // mg/L
  tssLevel: number; // mg/L
  remarks?: string;
  proofUrl?: string; // photo proof
  operatorUid: string;
  operatorName: string;
  timestamp: string;
}

@Injectable()
export class OperatorLogService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async submitLog(logData: Partial<OperatorLog>, user: any): Promise<OperatorLog> {
    const docRef = this.firebaseService.db.collection('operator_logs').doc();
    const newLog: OperatorLog = {
      id: docRef.id,
      influentFlowRate: Number(logData.influentFlowRate) || 0,
      effluentFlowRate: Number(logData.effluentFlowRate) || 0,
      phLevel: Number(logData.phLevel) || 7.0,
      codLevel: Number(logData.codLevel) || 0,
      bodLevel: Number(logData.bodLevel) || 0,
      tssLevel: Number(logData.tssLevel) || 0,
      remarks: logData.remarks || '',
      proofUrl: logData.proofUrl || '',
      operatorUid: user.uid,
      operatorName: user.name || user.email,
      timestamp: new Date().toISOString(),
    };

    await docRef.set(newLog);
    return newLog;
  }

  async getLogs(): Promise<OperatorLog[]> {
    const snapshot = await this.firebaseService.db.collection('operator_logs').get();
    const logs: OperatorLog[] = [];
    snapshot.forEach((doc) => logs.push(doc.data() as OperatorLog));
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

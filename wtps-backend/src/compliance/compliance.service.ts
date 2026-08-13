import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface ComplianceRecord {
  id?: string;
  parameterName: string; // e.g. pH, COD, BOD, TSS, Oil & Grease
  measuredValue: number;
  permissibleLimit: number;
  unit: string;
  status: 'Compliant' | 'Warning' | 'Violation';
  recordedBy: string;
  timestamp: string;
}

@Injectable()
export class ComplianceService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createRecord(data: Partial<ComplianceRecord>, user: any): Promise<ComplianceRecord> {
    const docRef = this.firebaseService.db.collection('compliance_records').doc();
    const measured = Number(data.measuredValue) || 0;
    const limit = Number(data.permissibleLimit) || 100;
    let status: 'Compliant' | 'Warning' | 'Violation' = 'Compliant';

    if (measured > limit) {
      status = 'Violation';
    } else if (measured > limit * 0.85) {
      status = 'Warning';
    }

    const newRecord: ComplianceRecord = {
      id: docRef.id,
      parameterName: data.parameterName || 'pH',
      measuredValue: measured,
      permissibleLimit: limit,
      unit: data.unit || 'mg/L',
      status,
      recordedBy: user.name || user.email,
      timestamp: new Date().toISOString(),
    };

    await docRef.set(newRecord);
    return newRecord;
  }

  async getRecords(): Promise<ComplianceRecord[]> {
    const snapshot = await this.firebaseService.db.collection('compliance_records').get();
    const records: ComplianceRecord[] = [];
    snapshot.forEach((doc) => records.push(doc.data() as ComplianceRecord));
    return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

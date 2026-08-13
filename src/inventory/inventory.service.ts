import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

export interface InventoryItem {
  id?: string;
  itemName: string;
  category: 'Chemical' | 'Spare Part' | 'Consumable';
  quantity: number;
  unit: string;
  minThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Critical';
  updatedBy: string;
  lastUpdated: string;
}

@Injectable()
export class InventoryService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async addItem(data: Partial<InventoryItem>, user: any): Promise<InventoryItem> {
    const docRef = this.firebaseService.db.collection('inventory').doc();
    const qty = Number(data.quantity) || 0;
    const threshold = Number(data.minThreshold) || 10;
    let status: 'In Stock' | 'Low Stock' | 'Critical' = 'In Stock';

    if (qty === 0) status = 'Critical';
    else if (qty <= threshold) status = 'Low Stock';

    const newItem: InventoryItem = {
      id: docRef.id,
      itemName: data.itemName || 'Alum / Poly Coagulant',
      category: data.category || 'Chemical',
      quantity: qty,
      unit: data.unit || 'kg',
      minThreshold: threshold,
      status,
      updatedBy: user.name || user.email,
      lastUpdated: new Date().toISOString(),
    };

    await docRef.set(newItem);
    return newItem;
  }

  async getInventory(): Promise<InventoryItem[]> {
    const snapshot = await this.firebaseService.db.collection('inventory').get();
    const items: InventoryItem[] = [];
    snapshot.forEach((doc) => items.push(doc.data() as InventoryItem));
    return items.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }
}

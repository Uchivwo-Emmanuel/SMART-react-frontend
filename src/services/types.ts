// src/types.ts

export interface ItemPack {
  id: number;
  type: string;
  qty: number;
  costPrice: number;
  sellingPrice: number;
}

export interface Item {
  id: number;
  name: string;
  active: boolean;
  packs: ItemPack[];
}

export interface CreateItemRequest {
  name: string;
  packs: {
    type: string;
    qty: number;
    costPrice: number;
    sellingPrice: number;
  }[];
}

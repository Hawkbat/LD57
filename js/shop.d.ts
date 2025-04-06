import { Entity } from "./entity.js";
interface ShopItem {
    name: string;
    price: number;
    onPurchase: () => void;
    stock: number;
}
export declare class Shop extends Entity {
    cursorIndex: number;
    purchases: ShopItem[];
    money: number;
    get sortOrder(): number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare const shop: Shop;
export {};

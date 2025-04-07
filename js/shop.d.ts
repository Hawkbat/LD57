import { Entity } from "./entity.js";
interface ShopItem {
    name: string;
    price: number;
    onPurchase: () => void;
    stock: number;
    frame: number;
}
export declare class Shop extends Entity {
    menuCursorIndex: number;
    upgradeCursorIndex: number;
    inUpgradeMenu: boolean;
    purchases: ShopItem[];
    money: number;
    get sortOrder(): number;
    reset(): void;
    update(dt: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare const shop: Shop;
export {};

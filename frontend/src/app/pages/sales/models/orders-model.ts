export interface Order {
    OrderID: number;          // The unique identifier for the order
    OrderDate: string;        // The date the order was placed
    ShopID: string;           // The identifier for the shop
    ShippingAddress: string;  // Shipping address for the order
    ProductName: string;      // The name of the product
    Quantity: number;         // Quantity of products in the order
    ProductId: number;        // Product identifier
    Shipping_city: string;    // City where the product is being shipped
    Shipping_country: string; // Country where the product is being shipped
    shipping_id: string;      // Shipping identifier
    shop_city: string;        // City where the shop is located
    shop_country: string;     // Country where the shop is located
    shop_geo_id: string;      
  }
  
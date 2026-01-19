export enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  FREELANCER = 'freelancer',
  ADMIN = 'admin',
}

export enum SellerCategory {
  FOURNISSEUR = 'fournisseur',
  IMPORTATEUR = 'importateur',
  GROSSISTE = 'grossiste',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum B2BOfferType {
  NEGOTIABLE = 'negotiable',
  AUCTION = 'auction',
}

export enum B2BOfferStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CLOSED = 'closed',
  SOLD = 'sold',
}

export enum B2BResponseType {
  BID = 'bid',
  NEGOTIATION = 'negotiation',
}

export enum B2BResponseStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  OUTBID = 'outbid',
  WITHDRAWN = 'withdrawn',
}

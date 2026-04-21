import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
  date,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();
const deletedAt = () => timestamp("deleted_at", { withTimezone: true });

export const movementTypeEnum = pgEnum("movement_type", [
  "RECEIVE",
  "ISSUE",
  "TRANSFER",
  "ADJUST",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "AVAILABLE",
  "IN_USE",
  "REPAIR",
  "RETIRED",
  "LOST",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "ARCHIVE",
  "RESTORE",
  "MOVEMENT",
]);

export const ssoUsers = pgTable(
  "sso_users",
  {
    id: id(),
    ssoSubject: text("sso_subject").notNull(),
    email: text("email"),
    displayName: text("display_name"),
    role: text("role"),
    rawClaims: jsonb("raw_claims"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [uniqueIndex("sso_users_subject_uidx").on(t.ssoSubject)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    id: id(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    taxId: text("tax_id"),
    contactName: text("contact_name"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("suppliers_code_uidx").on(t.code),
    index("suppliers_name_idx").on(t.name),
  ],
);

export const warehouses = pgTable(
  "warehouses",
  {
    id: id(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [uniqueIndex("warehouses_code_uidx").on(t.code)],
);

export const locations = pgTable(
  "locations",
  {
    id: id(),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("locations_warehouse_code_uidx").on(t.warehouseId, t.code),
    index("locations_warehouse_idx").on(t.warehouseId),
  ],
);

export const materials = pgTable(
  "materials",
  {
    id: id(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    category: text("category"),
    unit: text("unit").notNull(),
    barcode: text("barcode"),
    defaultSupplierId: uuid("default_supplier_id").references(
      () => suppliers.id,
      { onDelete: "set null" },
    ),
    reorderPoint: numeric("reorder_point", { precision: 14, scale: 3 }),
    reorderQty: numeric("reorder_qty", { precision: 14, scale: 3 }),
    trackExpiry: boolean("track_expiry").notNull().default(false),
    shelfLifeDays: integer("shelf_life_days"),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("materials_code_uidx").on(t.code),
    index("materials_name_idx").on(t.name),
    index("materials_category_idx").on(t.category),
  ],
);

export const assets = pgTable(
  "assets",
  {
    id: id(),
    assetTag: text("asset_tag").notNull(),
    name: text("name").notNull(),
    category: text("category"),
    serialNumber: text("serial_number"),
    supplierId: uuid("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    status: assetStatusEnum("status").notNull().default("AVAILABLE"),
    purchaseDate: date("purchase_date"),
    purchasePrice: numeric("purchase_price", { precision: 14, scale: 2 }),
    warrantyExpiresAt: date("warranty_expires_at"),
    note: text("note"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    uniqueIndex("assets_tag_uidx").on(t.assetTag),
    index("assets_serial_idx").on(t.serialNumber),
    index("assets_status_idx").on(t.status),
    index("assets_location_idx").on(t.locationId),
  ],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: id(),
    type: movementTypeEnum("type").notNull(),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "restrict" }),
    fromLocationId: uuid("from_location_id").references(() => locations.id, {
      onDelete: "restrict",
    }),
    toLocationId: uuid("to_location_id").references(() => locations.id, {
      onDelete: "restrict",
    }),
    qty: numeric("qty", { precision: 14, scale: 3 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 14, scale: 2 }),
    supplierId: uuid("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    lotNumber: text("lot_number"),
    expiryDate: date("expiry_date"),
    referenceNo: text("reference_no"),
    reason: text("reason"),
    note: text("note"),
    actorSsoUserId: uuid("actor_sso_user_id")
      .notNull()
      .references(() => ssoUsers.id, { onDelete: "restrict" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [
    index("movements_material_time_idx").on(t.materialId, t.occurredAt),
    index("movements_type_idx").on(t.type),
    index("movements_from_loc_idx").on(t.fromLocationId),
    index("movements_to_loc_idx").on(t.toLocationId),
    index("movements_actor_idx").on(t.actorSsoUserId),
  ],
);

export const stockBalances = pgTable(
  "stock_balances",
  {
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "restrict" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "restrict" }),
    qty: numeric("qty", { precision: 14, scale: 3 }).notNull().default("0"),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.materialId, t.locationId] }),
    index("balances_location_idx").on(t.locationId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: id(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: auditActionEnum("action").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    actorSsoUserId: uuid("actor_sso_user_id").references(() => ssoUsers.id, {
      onDelete: "set null",
    }),
    requestId: text("request_id"),
    ip: text("ip"),
    userAgent: text("user_agent"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_actor_idx").on(t.actorSsoUserId),
    index("audit_time_idx").on(t.at),
  ],
);

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  locations: many(locations),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [locations.warehouseId],
    references: [warehouses.id],
  }),
  balances: many(stockBalances),
  assets: many(assets),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  materials: many(materials),
  assets: many(assets),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  defaultSupplier: one(suppliers, {
    fields: [materials.defaultSupplierId],
    references: [suppliers.id],
  }),
  movements: many(stockMovements),
  balances: many(stockBalances),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [assets.supplierId],
    references: [suppliers.id],
  }),
  location: one(locations, {
    fields: [assets.locationId],
    references: [locations.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  material: one(materials, {
    fields: [stockMovements.materialId],
    references: [materials.id],
  }),
  fromLocation: one(locations, {
    fields: [stockMovements.fromLocationId],
    references: [locations.id],
  }),
  toLocation: one(locations, {
    fields: [stockMovements.toLocationId],
    references: [locations.id],
  }),
  supplier: one(suppliers, {
    fields: [stockMovements.supplierId],
    references: [suppliers.id],
  }),
  actor: one(ssoUsers, {
    fields: [stockMovements.actorSsoUserId],
    references: [ssoUsers.id],
  }),
}));

export const stockBalancesRelations = relations(stockBalances, ({ one }) => ({
  material: one(materials, {
    fields: [stockBalances.materialId],
    references: [materials.id],
  }),
  location: one(locations, {
    fields: [stockBalances.locationId],
    references: [locations.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(ssoUsers, {
    fields: [auditLogs.actorSsoUserId],
    references: [ssoUsers.id],
  }),
}));

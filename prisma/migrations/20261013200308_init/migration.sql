-- CreateEnum
CREATE TYPE "SaleUnit" AS ENUM ('PORTION', 'UNIT', 'PACKAGE');

-- CreateEnum
CREATE TYPE "PriceMode" AS ENUM ('PER_KG', 'FIXED');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('ECONOMICO', 'CLASICO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "AsadoRole" AS ENUM ('CARNE', 'ACHURA', 'EMBUTIDO', 'EXTRA', 'ACCESORIO', 'FUEGO');

-- CreateEnum
CREATE TYPE "ComboPricing" AS ENUM ('FIXED', 'PER_PERSON');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('SOLICITADA', 'PENDIENTE_CONTACTO', 'PENDIENTE_CONFIRMACION', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO_PARA_RETIRAR', 'EN_REPARTO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('EXPRESS', 'PROGRAMADO', 'RETIRO');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'FIXED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "role" "AsadoRole" NOT NULL DEFAULT 'CARNE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "categoryId" TEXT NOT NULL,
    "role" "AsadoRole" NOT NULL DEFAULT 'CARNE',
    "tier" "Tier" NOT NULL DEFAULT 'CLASICO',
    "saleUnit" "SaleUnit" NOT NULL DEFAULT 'PORTION',
    "priceMode" "PriceMode" NOT NULL DEFAULT 'PER_KG',
    "pricePerKg" INTEGER,
    "fixedPrice" INTEGER,
    "portionMinGrams" INTEGER,
    "portionMaxGrams" INTEGER,
    "portionRefGrams" INTEGER,
    "unitGrams" INTEGER,
    "unitLabel" TEXT NOT NULL DEFAULT 'porción',
    "suggestedPerPerson" DOUBLE PRECISION,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "recommendable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Combo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "pricing" "ComboPricing" NOT NULL DEFAULT 'FIXED',
    "price" INTEGER NOT NULL,
    "compareAtPrice" INTEGER,
    "persons" INTEGER NOT NULL DEFAULT 4,
    "maxPersons" INTEGER,
    "badge" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboItem" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ComboItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "neighborhoods" TEXT,
    "fee" INTEGER NOT NULL DEFAULT 0,
    "minOrder" INTEGER NOT NULL DEFAULT 0,
    "freeShippingFrom" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningHour" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TEXT NOT NULL DEFAULT '18:00',
    "closeTime" TEXT NOT NULL DEFAULT '23:00',
    "slotMinutes" INTEGER NOT NULL DEFAULT 60,
    "slotCapacity" INTEGER NOT NULL DEFAULT 6,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClosedDate" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "ClosedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minTotal" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "publicToken" TEXT NOT NULL,
    "clientRequestId" TEXT,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "address" TEXT,
    "neighborhood" TEXT,
    "reference" TEXT,
    "mapsLink" TEXT,
    "zoneId" TEXT,
    "requestedDate" TEXT,
    "timeSlot" TEXT,
    "notes" TEXT,
    "subtotal" INTEGER NOT NULL,
    "deliveryFee" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "couponId" TEXT,
    "couponCode" TEXT,
    "total" INTEGER NOT NULL,
    "finalTotal" INTEGER,
    "paidAt" TIMESTAMP(3),
    "whatsappMessage" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'SOLICITADA',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "comboId" TEXT,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitLabel" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,
    "estimated" BOOLEAN NOT NULL DEFAULT false,
    "estWeightMinG" INTEGER,
    "estWeightMaxG" INTEGER,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "name" TEXT NOT NULL DEFAULT 'ENTRE CORTES',
    "slogan" TEXT NOT NULL DEFAULT 'Vos pone el fuego. Nosotros, el asado.',
    "slogan2" TEXT NOT NULL DEFAULT 'Del corte a tu parrilla, sin vueltas.',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT 'Parana, Entre Rios',
    "instagram" TEXT,
    "facebook" TEXT,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "expressEnabled" BOOLEAN NOT NULL DEFAULT true,
    "scheduledEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pickupEnabled" BOOLEAN NOT NULL DEFAULT true,
    "expressTargetMinutes" INTEGER NOT NULL DEFAULT 60,
    "prepTimeMinutes" INTEGER NOT NULL DEFAULT 30,
    "scheduleDaysAhead" INTEGER NOT NULL DEFAULT 7,
    "estimateNotice" TEXT NOT NULL DEFAULT 'Los precios de cortes son estimados segun el peso de referencia. El importe final se confirma por WhatsApp al pesar el pedido.',
    "policies" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalculatorSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "gramsPerAdult" INTEGER NOT NULL DEFAULT 450,
    "childFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "lightFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "heavyFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.25,
    "achuraSharePercent" INTEGER NOT NULL DEFAULT 15,
    "embutidoDiscountGrams" INTEGER NOT NULL DEFAULT 80,
    "cutsUpTo4" INTEGER NOT NULL DEFAULT 2,
    "cutsUpTo10" INTEGER NOT NULL DEFAULT 3,
    "cutsOver10" INTEGER NOT NULL DEFAULT 4,
    "minGramsPerPerson" INTEGER NOT NULL DEFAULT 300,
    "suggestExtras" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculatorSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_active_featured_idx" ON "Product"("active", "featured");

-- CreateIndex
CREATE UNIQUE INDEX "Combo_slug_key" ON "Combo"("slug");

-- CreateIndex
CREATE INDEX "ComboItem_comboId_idx" ON "ComboItem"("comboId");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHour_dayOfWeek_key" ON "OpeningHour"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "ClosedDate_date_key" ON "ClosedDate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "Order_clientRequestId_key" ON "Order"("clientRequestId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_phone_idx" ON "Order"("phone");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboItem" ADD CONSTRAINT "ComboItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

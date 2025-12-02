-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('BUS', 'MOVIE', 'FLIGHT');

-- CreateTable
CREATE TABLE "TicketProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusTrip" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seatsLeft" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusTrip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieShow" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "movieName" TEXT NOT NULL,
    "hall" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seatsLeft" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightTrip" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seatsLeft" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightTrip_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BusTrip" ADD CONSTRAINT "BusTrip_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TicketProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieShow" ADD CONSTRAINT "MovieShow_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TicketProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightTrip" ADD CONSTRAINT "FlightTrip_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "TicketProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

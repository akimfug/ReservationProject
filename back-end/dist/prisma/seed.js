"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const restaurant = await prisma.restaurant.upsert({
        where: { id: 'restaurant-1' },
        update: {},
        create: {
            id: 'restaurant-1',
            name: 'Demo Restaurant',
        },
    });
    console.log('Restaurant created:', restaurant);
    const tables = [
        { number: 'A1', seats: 2, posX: 100, posY: 100 },
        { number: 'A2', seats: 4, posX: 200, posY: 100 },
        { number: 'A3', seats: 6, posX: 300, posY: 100 },
        { number: 'B1', seats: 2, posX: 100, posY: 200 },
        { number: 'B2', seats: 4, posX: 200, posY: 200 },
        { number: 'B3', seats: 8, posX: 300, posY: 200 },
        { number: 'C1', seats: 2, posX: 100, posY: 300 },
        { number: 'C2', seats: 4, posX: 200, posY: 300 },
        { number: 'C3', seats: 6, posX: 300, posY: 300 },
        { number: 'VIP1', seats: 10, posX: 400, posY: 150 },
    ];
    for (const tableData of tables) {
        await prisma.table.upsert({
            where: {
                restaurantId_number: {
                    restaurantId: restaurant.id,
                    number: tableData.number,
                },
            },
            update: {},
            create: {
                restaurantId: restaurant.id,
                number: tableData.number,
                seats: tableData.seats,
                status: client_1.TableStatus.AVAILABLE,
                posX: tableData.posX,
                posY: tableData.posY,
            },
        });
    }
    console.log('Tables created');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservations = [
        {
            guestName: 'Иван Петров',
            phone: '+7 (999) 123-45-67',
            partySize: 4,
            startAt: new Date(today.getTime() + 12 * 60 * 60 * 1000),
            status: client_1.ReservationStatus.CONFIRMED,
        },
        {
            guestName: 'Анна Сидорова',
            phone: '+7 (999) 987-65-43',
            partySize: 2,
            startAt: new Date(today.getTime() + 19 * 60 * 60 * 1000),
            status: client_1.ReservationStatus.PENDING,
        },
        {
            guestName: 'Михаил Козлов',
            phone: '+7 (999) 555-12-34',
            partySize: 6,
            startAt: new Date(today.getTime() + 20 * 60 * 60 * 1000),
            status: client_1.ReservationStatus.CONFIRMED,
        },
        {
            guestName: 'Walk-in Guest',
            partySize: 2,
            startAt: new Date(),
            status: client_1.ReservationStatus.SEATED,
            isWalkIn: true,
            seatedAt: new Date(),
        },
    ];
    const createdTables = await prisma.table.findMany({
        where: { restaurantId: restaurant.id },
    });
    for (let i = 0; i < reservations.length; i++) {
        const reservation = reservations[i];
        await prisma.reservation.create({
            data: {
                restaurantId: restaurant.id,
                tableId: i < 3 ? createdTables[i]?.id : createdTables[0]?.id,
                guestName: reservation.guestName,
                phone: reservation.phone,
                partySize: reservation.partySize,
                startAt: reservation.startAt,
                status: reservation.status,
                isWalkIn: reservation.isWalkIn || false,
                seatedAt: reservation.seatedAt,
                expectedEnd: new Date(reservation.startAt.getTime() + 2 * 60 * 60 * 1000),
            },
        });
    }
    await prisma.table.update({
        where: { id: createdTables[0]?.id },
        data: { status: client_1.TableStatus.OCCUPIED },
    });
    await prisma.table.update({
        where: { id: createdTables[1]?.id },
        data: { status: client_1.TableStatus.RESERVED },
    });
    await prisma.table.update({
        where: { id: createdTables[2]?.id },
        data: { status: client_1.TableStatus.RESERVED },
    });
    await prisma.table.update({
        where: { id: createdTables[9]?.id },
        data: { status: client_1.TableStatus.OUT_OF_SERVICE },
    });
    console.log('Reservations created');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
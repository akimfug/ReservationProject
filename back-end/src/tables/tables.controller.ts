import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TableStatus } from '@prisma/client';

@Controller('api/tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: TableStatus; reservationId?: string },
  ) {
    if (body.reservationId) {
      return this.tablesService.assignToReservation(id, body.reservationId);
    }
    return this.tablesService.updateStatus(id, body.status);
  }
}

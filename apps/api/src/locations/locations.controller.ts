import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly svc: LocationsService) {}
  @Get()             findAll()                              { return this.svc.findAll(); }
  @Get(':id')        findOne(@Param('id') id: string)      { return this.svc.findOne(id); }
  @Post()            create(@Body() body: any)              { return this.svc.create(body); }
  @Patch(':id')      update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id')     remove(@Param('id') id: string)       { return this.svc.remove(id); }
}

import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}

  @Get('portfolio-health')
  portfolioHealth() {
    return this.svc.portfolioHealth();
  }

  @Get('utilization')
  utilization() {
    return this.svc.utilization();
  }

  @Get('attention')
  attention() {
    return this.svc.attention();
  }
}

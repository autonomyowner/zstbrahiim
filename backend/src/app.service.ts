import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'ZST Marketplace API',
      version: '1.0.0',
      description: 'Backend API for ZST B2B/B2C Marketplace with Real-time Features',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        docs: '/api/docs',
        health: '/health',
      },
    };
  }

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

import api from './api';
import { DashboardStats, AnalyticsData, User, Report, AuditLog } from '../types';

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getAnalytics(period?: string): Promise<{ success: boolean; data: AnalyticsData }> {
    const response = await api.get('/admin/analytics', { 
      params: period ? { period } : {} 
    });
    return response.data;
  },

  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ 
    success: boolean; 
    data: { 
      users: User[]; 
      totalPages: number; 
      currentPage: number; 
      total: number; 
    } 
  }> {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUser(
    userId: string, 
    updates: { 
      role?: string; 
      isActive?: boolean; 
      adminSettings?: any 
    }
  ): Promise<{ success: boolean; data: { user: User } }> {
    const response = await api.put(`/admin/users/${userId}`, updates);
    return response.data;
  },

  // Report Management
  async getReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    reportedItemType?: string;
    assignedTo?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ 
    success: boolean; 
    data: { 
      reports: Report[]; 
      totalPages: number; 
      currentPage: number; 
      total: number; 
    } 
  }> {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  async assignReport(reportId: string, assignedTo: string): Promise<{ success: boolean; data: { report: Report } }> {
    const response = await api.put(`/admin/reports/${reportId}/assign`, { assignedTo });
    return response.data;
  },

  async resolveReport(
    reportId: string, 
    resolution: { action: string; notes: string }
  ): Promise<{ success: boolean; data: { report: Report } }> {
    const response = await api.put(`/admin/reports/${reportId}/resolve`, resolution);
    return response.data;
  },

  // Audit Logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    performedBy?: string;
    targetType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ 
    success: boolean; 
    data: { 
      logs: AuditLog[]; 
      totalPages: number; 
      currentPage: number; 
      total: number; 
    } 
  }> {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // Bulk Actions
  async bulkModerate(actionData: {
    action: string;
    itemType: string;
    itemIds: string[];
    reason?: string;
  }): Promise<{ success: boolean; data: { modifiedCount: number } }> {
    const response = await api.post('/admin/moderate/bulk', actionData);
    return response.data;
  }
};

export const reportService = {
  async createReport(reportData: {
    reportedItemType: string;
    reportedItem: string;
    reason: string;
    description: string;
    severity?: string;
    evidence?: any[];
  }): Promise<{ success: boolean; data: { report: Report } }> {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  async getUserReports(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ 
    success: boolean; 
    data: { 
      reports: Report[]; 
      totalPages: number; 
      currentPage: number; 
      total: number; 
    } 
  }> {
    const response = await api.get('/reports/user', { params });
    return response.data;
  },

  async getReport(reportId: string): Promise<{ success: boolean; data: { report: Report } }> {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  }
};
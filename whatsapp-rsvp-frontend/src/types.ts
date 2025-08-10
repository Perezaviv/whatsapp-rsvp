
import React from 'react';

export enum RsvpStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  NEEDS_ATTENTION = 'NEEDS_ATTENTION',
  FAILED = 'FAILED',
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  status: RsvpStatus;
  lastUpdate: string;
  responseMessage?: string;
  attendeesCount?: number;
}

export interface ProcessedResponse {
  status: RsvpStatus;
  attendeesCount: number | null;
}

export interface Campaign {
  id: string;
  name: string;
  template: string;
  createdAt: string;
  guests: Guest[];
}

export interface KpiData {
  title: string;
  value: string;
  icon: React.ReactElement<{ className?: string }>;
  color: string;
}

export interface ActivityLogEntry {
  id: number;
  timestamp: string;
  message: string;
  status: 'success' | 'error' | 'info';
}
import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { INQUIRIES } from './inquiry.mock';
import type { IInquiry, IInquiryReply, InquiryStatus } from './inquiry.types';

@Injectable({ providedIn: 'root' })
export class InquiryStore {
  private readonly _inquiries = signal<IInquiry[]>(INQUIRIES);
  private readonly _saving = signal(false);

  readonly inquiries = this._inquiries.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<InquiryStatus, number>();
    this._inquiries().forEach((i) => map.set(i.status, (map.get(i.status) ?? 0) + 1));
    return map;
  });

  readonly newCount = computed(() => this._inquiries().filter((i) => i.status === 'new').length);

  findById(id: string): IInquiry | undefined {
    return this._inquiries().find((i) => i.id === id);
  }

  async setStatus(id: string, status: InquiryStatus): Promise<IInquiry | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 350);
      const inq = this.findById(id);
      if (!inq) return null;
      const updated: IInquiry = {
        ...inq,
        status,
        updatedAt: new Date().toISOString(),
      };
      this._inquiries.update((list) => list.map((x) => (x.id === id ? updated : x)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async assign(
    id: string,
    assignee: { id: string; name: string } | null,
  ): Promise<IInquiry | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 350);
      const inq = this.findById(id);
      if (!inq) return null;
      const updated: IInquiry = {
        ...inq,
        assigneeId: assignee?.id ?? null,
        assigneeName: assignee?.name ?? null,
        updatedAt: new Date().toISOString(),
      };
      this._inquiries.update((list) => list.map((x) => (x.id === id ? updated : x)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async addReply(
    id: string,
    reply: Omit<IInquiryReply, 'id' | 'occurredAt'>,
  ): Promise<IInquiry | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const inq = this.findById(id);
      if (!inq) return null;
      const occurredAt = new Date().toISOString();
      const newReply: IInquiryReply = {
        ...reply,
        id: `${inq.code}-rp-${inq.replies.length + 1}`,
        occurredAt,
      };
      const updated: IInquiry = {
        ...inq,
        replies: [...inq.replies, newReply],
        status: reply.channel === 'note' ? inq.status : 'replied',
        repliedAt: reply.channel === 'note' ? inq.repliedAt : occurredAt,
        updatedAt: occurredAt,
      };
      this._inquiries.update((list) => list.map((x) => (x.id === id ? updated : x)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }
}

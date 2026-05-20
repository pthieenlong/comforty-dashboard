import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { TICKETS } from './ticket.mock';
import type {
  EscalationLevel,
  ITicket,
  ITicketComment,
  ITicketEvent,
  TicketPriority,
  TicketStatus,
} from './ticket.types';

@Injectable({ providedIn: 'root' })
export class TicketStore {
  private readonly _tickets = signal<ITicket[]>(TICKETS);
  private readonly _saving = signal(false);

  readonly tickets = this._tickets.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<TicketStatus, number>();
    this._tickets().forEach((t) => map.set(t.status, (map.get(t.status) ?? 0) + 1));
    return map;
  });

  readonly unassignedCount = computed(
    () => this._tickets().filter((t) => t.status === 'open' && t.assigneeId === null).length,
  );

  findById(id: string): ITicket | undefined {
    return this._tickets().find((t) => t.id === id);
  }

  findByCustomer(customerId: string): ITicket[] {
    return this._tickets().filter((t) => t.customerId === customerId);
  }

  findByAssignee(userId: string): ITicket[] {
    return this._tickets().filter((t) => t.assigneeId === userId);
  }

  private appendEvent(t: ITicket, ev: ITicketEvent): ITicket {
    return { ...t, events: [...t.events, ev], updatedAt: ev.occurredAt };
  }

  async transition(
    id: string,
    next: TicketStatus,
    actor: string,
    note = '',
  ): Promise<ITicket | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const ticket = this.findById(id);
      if (!ticket) return null;
      const occurredAt = new Date().toISOString();
      const ev: ITicketEvent = {
        id: `${ticket.code}-evt-${ticket.events.length + 1}`,
        occurredAt,
        action: next === 'resolved' ? 'resolved' : 'status_changed',
        actor,
        details: note || `Chuyển sang ${next}`,
      };
      const updated: ITicket = this.appendEvent(
        {
          ...ticket,
          status: next,
          resolvedAt: next === 'resolved' ? occurredAt : ticket.resolvedAt,
          closedAt: next === 'closed' ? occurredAt : ticket.closedAt,
        },
        ev,
      );
      this._tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async assign(
    id: string,
    assignee: { id: string; name: string } | null,
    actor: string,
  ): Promise<ITicket | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const ticket = this.findById(id);
      if (!ticket) return null;
      const ev: ITicketEvent = {
        id: `${ticket.code}-evt-${ticket.events.length + 1}`,
        occurredAt: new Date().toISOString(),
        action: 'assigned',
        actor,
        details: assignee ? `Giao cho ${assignee.name}` : 'Bỏ assign',
      };
      const updated: ITicket = this.appendEvent(
        {
          ...ticket,
          assigneeId: assignee?.id ?? null,
          assigneeName: assignee?.name ?? null,
          status: assignee && ticket.status === 'open' ? 'in_progress' : ticket.status,
        },
        ev,
      );
      this._tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async escalate(
    id: string,
    nextLevel: EscalationLevel,
    actor: string,
    reason: string,
  ): Promise<ITicket | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const ticket = this.findById(id);
      if (!ticket) return null;
      const ev: ITicketEvent = {
        id: `${ticket.code}-evt-${ticket.events.length + 1}`,
        occurredAt: new Date().toISOString(),
        action: 'escalated',
        actor,
        details: `Escalate lên cấp ${nextLevel}${reason ? ' — ' + reason : ''}`,
      };
      const updated: ITicket = this.appendEvent({ ...ticket, escalationLevel: nextLevel }, ev);
      this._tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async setPriority(id: string, priority: TicketPriority, actor: string): Promise<ITicket | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 300);
      const ticket = this.findById(id);
      if (!ticket) return null;
      const ev: ITicketEvent = {
        id: `${ticket.code}-evt-${ticket.events.length + 1}`,
        occurredAt: new Date().toISOString(),
        action: 'priority_changed',
        actor,
        details: `Đổi ưu tiên sang ${priority}`,
      };
      const updated: ITicket = this.appendEvent({ ...ticket, priority }, ev);
      this._tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async addComment(
    id: string,
    comment: Omit<ITicketComment, 'id' | 'occurredAt'>,
  ): Promise<ITicket | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 300);
      const ticket = this.findById(id);
      if (!ticket) return null;
      const occurredAt = new Date().toISOString();
      const newComment: ITicketComment = {
        ...comment,
        id: `${ticket.code}-cmt-${ticket.comments.length + 1}`,
        occurredAt,
      };
      const ev: ITicketEvent = {
        id: `${ticket.code}-evt-${ticket.events.length + 1}`,
        occurredAt,
        action: 'commented',
        actor: comment.authorName,
        details: comment.internal ? 'Thêm ghi chú nội bộ' : 'Trả lời khách',
      };
      const updated: ITicket = {
        ...ticket,
        comments: [...ticket.comments, newComment],
        events: [...ticket.events, ev],
        updatedAt: occurredAt,
      };
      this._tickets.update((list) => list.map((t) => (t.id === id ? updated : t)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async createTicket(ticket: ITicket): Promise<ITicket> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 250, 500);
      this._tickets.update((list) => [ticket, ...list]);
      return ticket;
    } finally {
      this._saving.set(false);
    }
  }

  nextCode(): string {
    return `TK${String(this._tickets().length + 1).padStart(4, '0')}`;
  }
}

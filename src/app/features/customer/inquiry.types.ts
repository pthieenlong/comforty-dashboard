export type InquiryStatus = 'new' | 'replied' | 'archived';

export type InquirySource = 'web_contact' | 'social' | 'phone' | 'email';

export interface IInquiryReply {
  id: string;
  occurredAt: string;
  authorId: string;
  authorName: string;
  body: string;
  channel: 'email' | 'phone' | 'note';
}

export interface IInquiry {
  id: string;
  code: string;
  // Sender info — không link tới customer (visitor không có account).
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  source: InquirySource;
  subject: string;
  message: string;
  status: InquiryStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  // Optionally link đến customer nếu match email/phone với existing customer.
  matchedCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  repliedAt: string | null;
  replies: IInquiryReply[];
}

export interface InquiryStatusMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

export const INQUIRY_STATUS_META: Record<InquiryStatus, InquiryStatusMeta> = {
  new: { label: 'Mới', badgeVariant: 'info' },
  replied: { label: 'Đã trả lời', badgeVariant: 'success' },
  archived: { label: 'Đã lưu trữ', badgeVariant: 'neutral' },
};

export const INQUIRY_SOURCE_META: Record<InquirySource, { label: string }> = {
  web_contact: { label: 'Web Contact' },
  social: { label: 'Mạng xã hội' },
  phone: { label: 'Điện thoại' },
  email: { label: 'Email' },
};

export const REPLY_CHANNEL_META: Record<IInquiryReply['channel'], { label: string }> = {
  email: { label: 'Email' },
  phone: { label: 'Điện thoại' },
  note: { label: 'Ghi chú nội bộ' },
};

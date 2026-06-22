import type { KycDocument } from '@prisma/client';
import type { KycDocumentDto } from '@carrymate/shared';

export function toKycDocumentDto(doc: KycDocument): KycDocumentDto {
  return {
    id: doc.id,
    docType: doc.docType,
    status: doc.status,
    rejectReason: doc.rejectReason,
    fileKey: doc.fileKey,
    createdAt: doc.createdAt.toISOString(),
    reviewedAt: doc.reviewedAt ? doc.reviewedAt.toISOString() : null,
  };
}

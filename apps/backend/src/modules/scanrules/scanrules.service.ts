import type { ScanRuleDto, ActiveScanRule } from '@carrymate/shared';
import type { ScanRule } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import type { CreateScanRuleInput, UpdateScanRuleInput } from './scanrules.validators';

function toDto(r: ScanRule): ScanRuleDto {
  return {
    id: r.id,
    label: r.label,
    kind: r.kind,
    category: r.category,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/** Full list for the admin panel. */
export async function listScanRules(): Promise<ScanRuleDto[]> {
  const rows = await prisma.scanRule.findMany({
    orderBy: [{ kind: 'asc' }, { category: 'asc' }, { label: 'asc' }],
  });
  return rows.map(toDto);
}

/** Active rules the mobile app pulls to drive the on-device scan. */
export async function listActiveScanRules(): Promise<ActiveScanRule[]> {
  const rows = await prisma.scanRule.findMany({
    where: { active: true },
    select: { label: true, kind: true, category: true },
    orderBy: { label: 'asc' },
  });
  return rows;
}

export async function createScanRule(input: CreateScanRuleInput): Promise<ScanRuleDto> {
  const rule = await prisma.scanRule.create({
    data: {
      label: input.label.trim().toLowerCase(),
      kind: input.kind,
      category: input.category?.trim() || null,
      active: input.active ?? true,
    },
  });
  return toDto(rule);
}

export async function updateScanRule(id: string, input: UpdateScanRuleInput): Promise<ScanRuleDto> {
  const exists = await prisma.scanRule.findUnique({ where: { id } });
  if (!exists) throw AppError.notFound('Scan rule not found');
  const rule = await prisma.scanRule.update({
    where: { id },
    data: {
      ...(input.label !== undefined ? { label: input.label.trim().toLowerCase() } : {}),
      ...(input.kind !== undefined ? { kind: input.kind } : {}),
      ...(input.category !== undefined ? { category: input.category?.trim() || null } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
  });
  return toDto(rule);
}

export async function deleteScanRule(id: string): Promise<void> {
  try {
    await prisma.scanRule.delete({ where: { id } });
  } catch {
    throw AppError.notFound('Scan rule not found');
  }
}

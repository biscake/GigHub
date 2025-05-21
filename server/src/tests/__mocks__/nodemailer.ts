import type { Transporter } from 'nodemailer';
import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';

export const mockTransporter = mockDeep<Transporter>();

export const createTransport = vi.fn(() => mockTransporter);

export default { createTransport };
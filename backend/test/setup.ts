jest.mock('@prisma/client', () => ({
  ...jest.requireActual('@prisma/client'),
  Role: {
    CUSTOMER: 'CUSTOMER',
    PROVIDER: 'PROVIDER',
    ADMIN: 'ADMIN',
  },
}));

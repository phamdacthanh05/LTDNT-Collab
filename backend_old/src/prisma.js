const { PrismaClient } = require('@prisma/client');

// Dùng 1 instance duy nhất trong toàn app để tránh mở quá nhiều kết nối SQL
const prisma = new PrismaClient();

module.exports = prisma;

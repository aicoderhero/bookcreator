import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@bookcreator.com',
    },
  })

  console.log('Created admin user:', admin)

  // Create some sample authors
  const author1 = await prisma.author.create({
    data: {
      name: 'John Doe',
      role: 'Penulis Utama',
      description: 'Penulis berpengalaman dalam bidang teknologi',
    },
  })

  const author2 = await prisma.author.create({
    data: {
      name: 'Jane Smith',
      role: 'Editor',
      description: 'Editor profesional dengan 10 tahun pengalaman',
    },
  })

  console.log('Created authors:', [author1, author2])

  // Create default site settings
  const settings = await prisma.siteSettings.upsert({
    where: { key: 'defaultHomeMessage' },
    update: {},
    create: {
      key: 'defaultHomeMessage',
      value: 'Selamat datang di Book Creator. Saat ini belum ada buku yang dipublish. Silakan login sebagai admin untuk membuat dan mempublish buku pertama Anda.',
      description: 'Default message displayed on homepage when no books are published',
    },
  })

  console.log('Created site settings:', settings)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
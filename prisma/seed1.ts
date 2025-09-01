import { PrismaClient } from '@prisma/client';
import { clerkClient } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all teachers...');
  
  const teachers = await prisma.teacher.findMany({
    select: {
      id: true,
      name: true,
      teacherId: true
    }
  });

  console.log(`Found ${teachers.length} teachers`);

  for (const teacher of teachers) {
    try {
      // Get last 4 digits of teacherId
      const last4Digits = teacher.teacherId.slice(-4);
      
      // Create password pattern: name@last4Digits
      const newPassword = `${teacher.name}@${last4Digits}`;
      
      console.log(`Updating password for ${teacher.name} (${teacher.teacherId}): ${newPassword}`);
      
      // Update password in Clerk
      await (await clerkClient()).users.updateUser(teacher.id, {
        password: newPassword
      });
      
      console.log(`✅ Successfully updated password for ${teacher.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to update password for ${teacher.name}:`, error);
    }
  }

  console.log('Password update process completed!');
}

main()
  .then(() => {
    console.log('Seeding complete.');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  }); 
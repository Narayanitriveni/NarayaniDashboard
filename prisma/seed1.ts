import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  console.log('Starting to delete fees for Class-6E (ID: 31)...');
  
  try {
    // First, find all students enrolled in Class-6E
    const studentsInClass = await prisma.enrollment.findMany({
      where: {
        classId: 31, // Class-6E ID
        leftAt: null // Only current enrollments
      },
      include: {
        student: true
      }
    });
    
    console.log(`Found ${studentsInClass.length} students in Class-6E`);
    
    if (studentsInClass.length === 0) {
      console.log('No students found in Class-6E');
      return;
    }
    
    // Get student IDs
    const studentIds = studentsInClass.map(enrollment => enrollment.student.id);
    console.log('Student IDs:', studentIds);
    
    // Delete all fees for these students
    const deletedFees = await prisma.fee.deleteMany({
      where: {
        studentId: {
          in: studentIds
        }
      }
    });
    
    console.log(`Successfully deleted ${deletedFees.count} fee records for Class-6E students`);
    
    // Also delete any payments related to these fees
    const deletedPayments = await prisma.payment.deleteMany({
      where: {
        fee: {
          studentId: {
            in: studentIds
          }
        }
      }
    });
    
    console.log(`Successfully deleted ${deletedPayments.count} payment records for Class-6E students`);
    
    console.log('Cleanup complete!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
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
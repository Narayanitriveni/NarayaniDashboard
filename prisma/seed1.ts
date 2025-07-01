import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data for a clean slate
  // await prisma.student.deleteMany({});
  
  // await prisma.assignment.deleteMany({})
  await prisma.attendance.deleteMany({})
  // await prisma.teacherAttendance.deleteMany({})

  // await prisma.lesson.deleteMany({})
  // await prisma.teacher.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.fee.deleteMany({});

  // await prisma.result.deleteMany({});
  // await prisma.parent.deleteMany({});
  await prisma.enrollment.deleteMany({});
  

  await prisma.student.deleteMany({});
//   console.log("teacher Deleted, Student Deleted")
  
//   await prisma.class.deleteMany({});
//   await prisma.subject.deleteMany({});
//   await prisma.grade.deleteMany({});

//   // Create grades 1 to 12
//   const grades = [];
//   for (let i = 1; i <= 12; i++) {
//     const grade = await prisma.grade.create({
//       data: { level: i },
//     });
//     grades.push(grade);
//     console.log(`Created grade: ${grade.level}`);
//   }

//   // Create subjects
//   const subjectNames = [
//     'Mathematics',
//     'Science',
//     'English',
//     'History',
//     'Geography',
//     'Physics',
//     'Chemistry',
//     'Biology',
//     'Computer Science',
//     'Physical Education',
//     'Art',
//     'Music',
//     'Foreign Language',
//     'Social Studies',
//     'Economics',
//   ];

//   for (const name of subjectNames) {
//     await prisma.subject.create({
//       data: { name },
//     });
//     console.log(`Created subject: ${name}`);
//   }

//   // Create one class per grade (1-12), name is just the grade number as string
//   for (const grade of grades) {
//     const classObj = await prisma.class.create({
//       data: {
//         name: `${grade.level}`,
//         capacity: 100,
//         gradeId: grade.id,
//       },
//     });
//     console.log(`Created class: ${classObj.name}`);
//   }
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
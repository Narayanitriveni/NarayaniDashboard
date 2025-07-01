// import { PrismaClient, Day, UserSex, AttendanceStatus, FeeStatus, PaymentMethod } from '@prisma/client';
// import { faker } from '@faker-js/faker';

// // Initialize Prisma client
// const prisma = new PrismaClient();

// async function main() {
//   console.log('Starting seeding...');

//   // Get current date once to use throughout
//   const today = new Date();

//   // Clear existing data in reverse order of dependencies
//   await prisma.payment.deleteMany({});
//   await prisma.fee.deleteMany({});
//   await prisma.attendance.deleteMany({});
//   await prisma.teacherAttendance.deleteMany({});
//   await prisma.result.deleteMany({});
//   await prisma.assignment.deleteMany({});
//   await prisma.exam.deleteMany({});
//   await prisma.lesson.deleteMany({});
//   await prisma.announcement.deleteMany({});
//   await prisma.event.deleteMany({});
//   await prisma.student.deleteMany({});
//   await prisma.class.deleteMany({});
//   await prisma.subject.deleteMany({});
//   await prisma.teacher.deleteMany({});
//   await prisma.parent.deleteMany({});
//   await prisma.grade.deleteMany({});
//   await prisma.accountant.deleteMany({});

//   console.log('Deleted existing data');

//   // Create grades (only 1-6 for smaller dataset)
//   const grades = [];
//   for (let i = 1; i <= 6; i++) {
//     const grade = await prisma.grade.create({
//       data: { level: i },
//     });
//     grades.push(grade);
//     console.log(`Created grade: ${grade.level}`);
//   }

//   // Create core subjects (reduced list)
//   const subjectNames = [
//     'Mathematics',
//     'Science',
//     'English',
//     'History',
//     'Geography',
//     'Computer Science',
//     'Physical Education',
//   ];

//   const subjects = [];
//   for (const name of subjectNames) {
//     const subject = await prisma.subject.create({
//       data: { name },
//     });
//     subjects.push(subject);
//     console.log(`Created subject: ${subject.name}`);
//   }

//   // Create 8 teachers (reduced from 30)
//   const teachers = [];
//   for (let i = 1; i <= 8; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const teacherId = `${i}480730003`;
    
//     const teacher = await prisma.teacher.create({
//       data: {
//         username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
//         teacherId: teacherId,
//         name: firstName,
//         surname: lastName,
//         email: faker.internet.email({ firstName, lastName }),
//         phone: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         img: faker.image.avatar(),
//         bloodType: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+']),
//         sex: faker.helpers.arrayElement(['MALE', 'FEMALE']) as UserSex,
//         birthday: faker.date.birthdate({ min: 25, max: 55, mode: 'age' }),
//         subjects: {
//           connect: faker.helpers.arrayElements(
//             subjects.map(subject => ({ id: subject.id })),
//             { min: 1, max: 2 }
//           ),
//         },
//       },
//       include: { subjects: true }
//     });
    
//     teachers.push(teacher);
//     console.log(`Created teacher: ${teacher.name} ${teacher.surname}`);
//   }

//   // Create teacher attendance (last 7 days only)
//   for (const teacher of teachers) {
//     for (let i = 0; i < 7; i++) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
      
//       const status = faker.helpers.arrayElement(['PRESENT', 'ABSENT', 'LATE']) as AttendanceStatus;
      
//       const attendanceData = {
//         date,
//         teacherId: teacher.id,
//         status,
//         ...(status !== 'ABSENT' ? {
//           inTime: status === 'LATE' ? '09:30' : '08:00',
//           outTime: status === 'LATE' ? '16:30' : '15:00',
//         } : {})
//       };

//       await prisma.teacherAttendance.create({ data: attendanceData });
//     }
//   }

//   // Create classes (only 1 section per grade)
//   const classes = [];
//   for (const grade of grades) {
//     const classTeacher = faker.helpers.arrayElement(teachers);
//     const classObj = await prisma.class.create({
//       data: {
//         name: `${grade.level}A`,
//         capacity: 25,
//         gradeId: grade.id,
//         supervisorId: classTeacher.id,
//       },
//     });
//     classes.push(classObj);
//     console.log(`Created class: ${classObj.name}`);
//   }

//   // Create 12 parents (reduced from 50)
//   const parents = [];
//   for (let i = 1; i <= 12; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const currentYear = new Date().getFullYear();
//     const parentId = `P-${currentYear}-${String(i).padStart(4, '0')}`;
    
//     const parent = await prisma.parent.create({
//       data: {
//         username: `parent_${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
//         parentId: parentId,
//         name: firstName,
//         surname: lastName,
//         email: faker.internet.email({ firstName, lastName }),
//         phone: faker.phone.number(),
//         address: faker.location.streetAddress(),
//       },
//     });
    
//     parents.push(parent);
//     console.log(`Created parent: ${parent.name} ${parent.surname}`);
//   }

//   // Create 24 students (2 per parent, reduced from 100)
//   const students = [];
//   for (let i = 0; i < 24; i++) {
//     const classObj = faker.helpers.arrayElement(classes);
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const parent = parents[Math.floor(i / 2)];
    
//     const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
//     const nameInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
//     const randomDigits = Math.floor(Math.random() * 900) + 100;
//     const studentId = `${dateString}${nameInitials}${randomDigits}`;
    
//     const student = await prisma.student.create({
//       data: {
//         username: `student_${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`,
//         StudentId: studentId,
//         IEMISCODE: faker.number.int({ min: 100000, max: 999999 }),
//         name: firstName,
//         surname: lastName,
//         motherName: faker.person.firstName() + ' ' + faker.person.lastName(),
//         fatherName: faker.person.firstName() + ' ' + faker.person.lastName(),
//         email: faker.internet.email({ firstName, lastName }),
//         phone: faker.phone.number(),
//         address: faker.location.streetAddress(),
//         img: faker.image.avatar(),
//         bloodType: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+']),
//         sex: faker.helpers.arrayElement(['MALE', 'FEMALE']) as UserSex,
//         birthday: faker.date.birthdate({ min: 6, max: 18, mode: 'age' }),
//         disability: 'NONE',
//         classId: classObj.id,
//         gradeId: classObj.gradeId,
//         parentId: parent.id,
//       },
//     });
    
//     students.push(student);
//     console.log(`Created student: ${student.name} ${student.surname} in class ${classObj.name}`);

//     // Create fee for student
//     const totalAmount = BigInt(faker.number.int({ min: 5000, max: 8000 }));
//     const paidAmount = BigInt(faker.number.int({ min: 0, max: Number(totalAmount) }));
//     const dueDate = faker.date.future();
    
//     let feeStatus: FeeStatus;
//     if (paidAmount >= totalAmount) {
//       feeStatus = 'PAID';
//     } else if (paidAmount === BigInt(0)) {
//       feeStatus = dueDate < today ? 'OVERDUE' : 'UNPAID';
//     } else {
//       feeStatus = dueDate < today ? 'OVERDUE' : 'PARTIAL';
//     }
    
//     const fee = await prisma.fee.create({
//       data: {
//         studentId: student.id,
//         totalAmount,
//         paidAmount,
//         dueDate,
//         status: feeStatus,
//         description: 'Tuition fee for academic year',
//       },
//     });
    
//     // Create payment if any amount is paid
//     if (paidAmount > BigInt(0)) {
//       const paymentMethod = faker.helpers.arrayElement(['CASH', 'CARD', 'UPI']) as PaymentMethod;
      
//       await prisma.payment.create({
//         data: {
//           transactionId: paymentMethod === 'CASH' ? null : `TXN${faker.string.alphanumeric(6).toUpperCase()}`,
//           amount: paidAmount,
//           date: faker.date.recent(),
//           method: paymentMethod,
//           reference: paymentMethod === 'CASH' ? 'Cash Payment' : faker.finance.accountNumber(),
//           feeId: fee.id,
//         },
//       });
//     }
//   }

//   // Create lessons (reduced to 15 total)
//   const dayOptions: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
//   let lessonCount = 0;
  
//   for (const classObj of classes) {
//     if (lessonCount >= 15) break;
    
//     const classSubjects = faker.helpers.arrayElements(subjects, { min: 1, max: 2 });
    
//     for (const subject of classSubjects) {
//       if (lessonCount >= 15) break;
      
//       const eligibleTeachers = teachers.filter(teacher => 
//         teacher.subjects.some(s => s.id === subject.id)
//       );
      
//       const teacher = eligibleTeachers.length > 0 
//         ? faker.helpers.arrayElement(eligibleTeachers) 
//         : faker.helpers.arrayElement(teachers);
      
//       const day = faker.helpers.arrayElement(dayOptions);
//       const startHour = faker.number.int({ min: 8, max: 14 });
//       const startTime = new Date();
//       startTime.setHours(startHour, 0, 0);
      
//       const endTime = new Date(startTime);
//       endTime.setHours(startHour + 1, 0, 0);
      
//       const lesson = await prisma.lesson.create({
//         data: {
//           name: `${subject.name} - ${classObj.name}`,
//           day,
//           startTime,
//           endTime,
//           subjectId: subject.id,
//           classId: classObj.id,
//           teacherId: teacher.id,
//         },
//       });
      
//       console.log(`Created lesson: ${lesson.name} on ${day}`);
//       lessonCount++;
      
//       // Create attendance for this lesson (5-8 students)
//       const classStudents = students.filter(student => student.classId === classObj.id);
//       const studentsForAttendance = faker.helpers.arrayElements(
//         classStudents,
//         faker.number.int({ min: 5, max: 8 })
//       );
      
//       for (const student of studentsForAttendance) {
//         const attendanceDate = faker.date.recent();
//         const inTime = new Date(attendanceDate);
//         inTime.setHours(startHour, faker.number.int({ min: 0, max: 30 }), 0);
        
//         await prisma.attendance.create({
//           data: {
//             date: attendanceDate,
//             studentId: student.id,
//             classId: classObj.id,
//             lessonId: lesson.id,
//             inTime: inTime,
//             status: faker.helpers.arrayElement(['PRESENT', 'ABSENT', 'LATE']) as AttendanceStatus,
//           },
//         });
//       }
      
//       // Create assignment for some lessons
//       if (faker.datatype.boolean()) {
//         const assignment = await prisma.assignment.create({
//           data: {
//             title: `${subject.name} Assignment`,
//             startDate: faker.date.recent(),
//             dueDate: faker.date.future(),
//             lessonId: lesson.id,
//           },
//         });
        
//         // Create results for assignment (3-5 students)
//         const studentsForResults = faker.helpers.arrayElements(
//           classStudents,
//           faker.number.int({ min: 3, max: 5 })
//         );
        
//         for (const student of studentsForResults) {
//           await prisma.result.create({
//             data: {
//               score: faker.number.int({ min: 60, max: 100 }),
//               assignmentId: assignment.id,
//               studentId: student.id,
//             },
//           });
//         }
//       }
//     }
//   }

//   // Create general attendance records (without lessons)
//   for (const classObj of classes) {
//     const classStudents = students.filter(student => student.classId === classObj.id);
//     const studentsForGeneralAttendance = faker.helpers.arrayElements(
//       classStudents,
//       faker.number.int({ min: 3, max: 5 })
//     );
    
//     for (const student of studentsForGeneralAttendance) {
//       const attendanceDate = faker.date.recent();
//       const inTime = new Date(attendanceDate);
//       inTime.setHours(faker.number.int({ min: 8, max: 14 }), faker.number.int({ min: 0, max: 30 }), 0);
      
//       await prisma.attendance.create({
//         data: {
//           date: attendanceDate,
//           studentId: student.id,
//           classId: classObj.id,
//           inTime: inTime,
//           status: faker.helpers.arrayElement(['PRESENT', 'ABSENT', 'LATE']) as AttendanceStatus,
//         },
//       });
//     }
//   }

//   // Create 3 events
//   for (let i = 0; i < 3; i++) {
//     const startTime = faker.date.future();
//     const endTime = new Date(startTime);
//     endTime.setHours(endTime.getHours() + faker.number.int({ min: 1, max: 2 }));
    
//     await prisma.event.create({
//       data: {
//         title: faker.helpers.arrayElement([
//           'Annual Sports Day', 
//           'Science Exhibition', 
//           'Parent-Teacher Meeting'
//         ]),
//         description: faker.lorem.sentence(),
//         startTime,
//         endTime,
//         classId: faker.helpers.arrayElement([null, ...classes.map(c => c.id)]),
//       },
//     });
//   }

//   // Create 5 announcements
//   for (let i = 0; i < 5; i++) {
//     await prisma.announcement.create({
//       data: {
//         title: faker.helpers.arrayElement([
//           'Important Notice', 
//           'Upcoming Event', 
//           'Schedule Change', 
//           'Holiday Announcement'
//         ]),
//         description: faker.lorem.sentence(),
//         date: faker.date.recent(),
//         classId: faker.helpers.arrayElement([null, ...classes.map(c => c.id)]),
//       },
//     });
//   }

//   console.log('Seeding completed successfully!');
//   console.log(`Created 8 teachers, 12 parents, and 24 students`);
//   console.log('Each parent is associated with 2 students');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
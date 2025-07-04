import { PrismaClient, Day, UserSex, AttendanceStatus, FeeStatus, PaymentMethod } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Get current date once to use throughout
  const today = new Date();

  // Clear existing data in reverse order of dependencies
  await prisma.payment.deleteMany({});
  await prisma.fee.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.teacherAttendance.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.accountant.deleteMany({});

  console.log('Deleted existing data');

  // Create grades (1-7 for 14 classes: 2 sections per grade)
  const grades = [];
  for (let i = 1; i <= 7; i++) {
    const grade = await prisma.grade.create({
      data: { level: i },
    });
    grades.push(grade);
    console.log(`Created grade: ${grade.level}`);
  }

  // Create core subjects
  const subjectNames = [
    'Mathematics',
    'Science',
    'English',
    'History',
    'Geography',
    'Computer Science',
    'Physical Education',
  ];
  const subjects = [];
  for (const name of subjectNames) {
    const subject = await prisma.subject.create({
      data: { name },
    });
    subjects.push(subject);
    console.log(`Created subject: ${subject.name}`);
  }

  // Create 30 teachers
  const teachers = [];
  for (let i = 1; i <= 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const teacherId = `${i}480730003`;
    const teacher = await prisma.teacher.create({
      data: {
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
        teacherId: teacherId,
        name: firstName,
        surname: lastName,
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        img: faker.image.avatar(),
        bloodType: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+']),
        sex: faker.helpers.arrayElement(['MALE', 'FEMALE']) as UserSex,
        birthday: faker.date.birthdate({ min: 25, max: 55, mode: 'age' }),
        subjects: {
          connect: faker.helpers.arrayElements(
            subjects.map(subject => ({ id: subject.id })),
            { min: 1, max: 2 }
          ),
        },
      },
      include: { subjects: true }
    });
    teachers.push(teacher);
    console.log(`Created teacher: ${teacher.name} ${teacher.surname}`);
  }

  // Create teacher attendance (last 7 days)
  for (const teacher of teachers) {
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const status = faker.helpers.arrayElement(['PRESENT', 'ABSENT', 'LATE']) as AttendanceStatus;
      const attendanceData = {
        date,
        teacherId: teacher.id,
        status,
        ...(status !== 'ABSENT' ? {
          inTime: status === 'LATE' ? '09:30' : '08:00',
          outTime: status === 'LATE' ? '16:30' : '15:00',
        } : {})
      };
      await prisma.teacherAttendance.create({ data: attendanceData });
    }
  }

  // Create 14 classes (2 per grade)
  const classes = [];
  const sectionLetters = ['A', 'B'];
  for (const grade of grades) {
    for (const section of sectionLetters) {
      const classTeacher = faker.helpers.arrayElement(teachers);
      const classObj = await prisma.class.create({
        data: {
          name: `${grade.level}${section}`,
          capacity: 15,
          gradeId: grade.id,
          supervisorId: classTeacher.id,
        },
      });
      classes.push(classObj);
      console.log(`Created class: ${classObj.name}`);
    }
  }

  // Create 50 parents
  const parents = [];
  for (let i = 1; i <= 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const currentYear = new Date().getFullYear();
    const parentId = `P-${currentYear}-${String(i).padStart(4, '0')}`;
    const parent = await prisma.parent.create({
      data: {
        username: `parent_${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
        parentId: parentId,
        name: firstName,
        surname: lastName,
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
      },
    });
    parents.push(parent);
    console.log(`Created parent: ${parent.name} ${parent.surname}`);
  }

  // Create 100 students (2 per parent)
  const students = [];
  for (let i = 0; i < 100; i++) {
    const classObj = faker.helpers.arrayElement(classes);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const parent = parents[Math.floor(i / 2)];
    const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const nameInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const randomDigits = Math.floor(Math.random() * 900) + 100;
    const studentId = `${dateString}${nameInitials}${randomDigits}`;
    const student = await prisma.student.create({
      data: {
        username: `student_${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`,
        StudentId: studentId,
        IEMISCODE: faker.number.int({ min: 100000, max: 999999 }),
        name: firstName,
        surname: lastName,
        motherName: faker.person.firstName() + ' ' + faker.person.lastName(),
        fatherName: faker.person.firstName() + ' ' + faker.person.lastName(),
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        img: faker.image.avatar(),
        bloodType: faker.helpers.arrayElement(['A+', 'B+', 'O+', 'AB+']),
        sex: faker.helpers.arrayElement(['MALE', 'FEMALE']) as UserSex,
        birthday: faker.date.birthdate({ min: 6, max: 18, mode: 'age' }),
        disability: 'NONE',
        parentId: parent.id,
      },
    });
    students.push(student);
    console.log(`Created student: ${student.name} ${student.surname} in class ${classObj.name}`);

    // Create enrollment for student
    await prisma.enrollment.create({
      data: {
        studentId: student.StudentId,
        classId: classObj.id,
        gradeId: classObj.gradeId,
        year: today.getFullYear(),
      },
    });

    // Create fee for student
    const totalAmount = BigInt(faker.number.int({ min: 5000, max: 8000 }));
    const paidAmount = BigInt(faker.number.int({ min: 0, max: Number(totalAmount) }));
    const dueDate = faker.date.future();
    let feeStatus: FeeStatus;
    if (paidAmount >= totalAmount) {
      feeStatus = 'PAID';
    } else if (paidAmount === BigInt(0)) {
      feeStatus = dueDate < today ? 'OVERDUE' : 'UNPAID';
    } else {
      feeStatus = dueDate < today ? 'OVERDUE' : 'PARTIAL';
    }
    const fee = await prisma.fee.create({
      data: {
        studentId: student.id,
        totalAmount,
        paidAmount,
        dueDate,
        status: feeStatus,
        description: 'Tuition fee for academic year',
      },
    });
    // Create payment if any amount is paid
    if (paidAmount > BigInt(0)) {
      const paymentMethod = faker.helpers.arrayElement(['CASH', 'CARD', 'UPI']) as PaymentMethod;
      await prisma.payment.create({
        data: {
          transactionId: paymentMethod === 'CASH' ? null : `TXN${faker.string.alphanumeric(6).toUpperCase()}`,
          amount: paidAmount,
          date: faker.date.recent(),
          method: paymentMethod,
          reference: paymentMethod === 'CASH' ? 'Cash Payment' : faker.finance.accountNumber(),
          feeId: fee.id,
        },
      });
    }
  }

  // Lessons, attendance, assignments, events, announcements, etc. can be generated similarly as before, scaling up as needed.
  // ...
  console.log('Seeding completed successfully!');
  console.log(`Created 30 teachers, 50 parents, and 100 students`);
  console.log('Each parent is associated with 2 students');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
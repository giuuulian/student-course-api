const storage = require("../../src/services/storage");

beforeEach(() => {
  storage.reset();
  storage.seed();
});

test("should not allow duplicate course title", () => {
  storage.create("courses", { title: "Math", teacher: "Someone" });
  const result = storage.create("courses", {
    title: "Math",
    teacher: "Someone",
  });
  expect(result.error).toBe("Course title must be unique");
});

test("should list seeded students", () => {
  const students = storage.list("students");
  expect(students.length).toBe(3);
  expect(students[0].name).toBe("Alice");
});

test("should create a new student", () => {
  const result = storage.create("students", {
    name: "David",
    email: "david@example.com",
  });
  expect(result.name).toBe("David");
  expect(storage.list("students").length).toBe(4);
});

test("should not allow duplicate student email", () => {
  const result = storage.create("students", {
    name: "Eve",
    email: "alice@example.com",
  });
  expect(result.error).toBe("Email must be unique");
});

test("should delete a student", () => {
  const students = storage.list("students");
  const result = storage.remove("students", students[0].id);
  expect(result).toBe(true);
});

test("should not allow more than 3 students in a course", () => {
  const students = storage.list("students");
  const course = storage.list("courses")[0];
  storage.create("students", { name: "Extra", email: "extra@example.com" });
  storage.create("students", { name: "Extra2", email: "extra2@example.com" });
  storage.create("students", { name: "Extra3", email: "extra3@example.com" });
  storage.enroll(students[0].id, course.id);
  storage.enroll(students[1].id, course.id);
  storage.enroll(students[2].id, course.id);
  const result = storage.enroll(4, course.id);
  expect(result.error).toBe("Course is full");
});

test("should not delete a course that has enrolled students", () => {
  const students = storage.list("students");
  const course = storage.list("courses")[0];
  storage.enroll(students[0].id, course.id);
  const result = storage.remove("courses", course.id);
  expect(result.error).toBe("Cannot delete course: students are enrolled");
});

test("should not enroll a non-existent student", () => {
  const course = storage.list("courses")[0];
  const result = storage.enroll(999, course.id);
  expect(result.error).toBe("Student not found");
});

test("should not enroll in non-existent course", () => {
  const students = storage.list("students");
  const result = storage.enroll(students[0].id, 999);
  expect(result.error).toBe("Course not found");
});

test("should not allow duplicate enrollment", () => {
  const student = storage.list("students")[0];
  const course = storage.list("courses")[0];
  storage.enroll(student.id, course.id);
  const result = storage.enroll(student.id, course.id);
  expect(result.error).toBe("Student already enrolled in this course");
});

test("should not delete a student who is enrolled in a course", () => {
  const students = storage.list("students");
  const courses = storage.list("courses");
  const student = students[0];
  const course = courses[0];

  storage.enroll(student.id, course.id);
  const result = storage.remove("students", student.id);
  expect(result.error).toBe("Cannot delete student: enrolled in a course");
});

test("unenroll removes an existing enrollment", () => {
  const s = storage.list("students")[0];
  const c = storage.list("courses")[0];
  storage.enroll(s.id, c.id);
  expect(storage.unenroll(s.id, c.id)).toEqual({ success: true });
  expect(storage.unenroll(s.id, c.id)).toEqual({
    error: "Enrollment not found",
  });
});

test("should get all courses for a student", () => {
  const student = storage.list("students")[0];
  const courses = storage.list("courses");

  storage.enroll(student.id, courses[0].id);
  storage.enroll(student.id, courses[1].id);

  const result = storage.getStudentCourses(student.id);
  expect(result.length).toBe(2);
  expect(result.map((c) => c.title)).toContain("Math");
  expect(result.map((c) => c.title)).toContain("Physics");
});

test("getCourseStudents returns enrolled students", () => {
  const [s1, s2] = storage.list("students");
  const course = storage.list("courses")[0];

  storage.enroll(s1.id, course.id);
  storage.enroll(s2.id, course.id);

  const result = storage.getCourseStudents(course.id);
  expect(result.map((s) => s.name)).toEqual(
    expect.arrayContaining(["Alice", "Bob"]),
  );
});

const request = require("supertest");
const app = require("../../src/app");

describe("Student-Course API integration", () => {
  beforeEach(() => {
    require("../../src/services/storage").reset();
    require("../../src/services/storage").seed();
  });

  test("GET /students should return seeded students", async () => {
    const res = await request(app).get("/students");
    expect(res.statusCode).toBe(200);
    expect(res.body.students.length).toBe(3);
    expect(res.body.students[0].name).toBe("Alice");
  });

  test("POST /students should create a new student", async () => {
    const res = await request(app)
      .post("/students")
      .send({ name: "David", email: "david@example.com" });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("David");
  });

  test("POST /students should not allow duplicate email", async () => {
    const res = await request(app)
      .post("/students")
      .send({ name: "Eve", email: "alice@example.com" });
    expect(res.statusCode).toBe(400);
  });

  test("DELETE /courses/:id should not delete a course even if students are enrolled", async () => {
    const courses = await request(app).get("/courses");
    const courseId = courses.body.courses[0].id;
    await request(app).post(`/courses/${courseId}/students/1`);
    const res = await request(app).delete(`/courses/${courseId}`);
    expect(res.statusCode).toBe(400);
  });

  test("GET /courses/:id success and 404", async () => {
    let res = await request(app).get("/courses/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.course.title).toBe("Math");
    res = await request(app).get("/courses/999");
    expect(res.statusCode).toBe(404);
  });

  test("POST /courses create and fail on missing fields", async () => {
    let res = await request(app)
      .post("/courses")
      .send({ title: "Biology", teacher: "Dr. Lee" });
    expect(res.statusCode).toBe(201);
    res = await request(app).post("/courses").send({ title: "Incomplete" });
    expect(res.statusCode).toBe(400);
  });

  test("DELETE /courses/:id success, blocked if students enrolled, 404 if not found", async () => {
    await request(app).post("/courses/1/students/1");

    let res = await request(app).delete("/courses/2");
    expect(res.statusCode).toBe(204);
    res = await request(app).delete("/courses/1");
    expect(res.statusCode).toBe(400);
    res = await request(app).delete("/courses/999");
    expect(res.statusCode).toBe(404);
  });

  test("PUT /courses/:id update, duplicate title, 404", async () => {
    let res = await request(app)
      .put("/courses/1")
      .send({ title: "Algebra", teacher: "Prof. X" });
    expect(res.statusCode).toBe(200);
    res = await request(app).put("/courses/2").send({ title: "Algebra" });
    expect(res.statusCode).toBe(400);
    res = await request(app).put("/courses/999").send({ title: "NonExistent" });
    expect(res.statusCode).toBe(404);
  });

  test("GET /students/:id success and 404", async () => {
    let res = await request(app).get("/students/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.student.name).toBe("Alice");
    res = await request(app).get("/students/999");
    expect(res.statusCode).toBe(404);
  });

  test("DELETE /students/:id success, blocked if enrolled, 404 if not found", async () => {
    await request(app).post("/courses/1/students/1");

    let res = await request(app).delete("/students/2");
    expect(res.statusCode).toBe(204);
    res = await request(app).delete("/students/1");
    expect(res.statusCode).toBe(400);
    res = await request(app).delete("/students/999");
    expect(res.statusCode).toBe(404);
  });

  test("PUT /students/:id update, email duplicate, 404", async () => {
    let res = await request(app)
      .put("/students/1")
      .send({ name: "Alice Updated", email: "alice@example.com" });
    expect(res.statusCode).toBe(200);
    res = await request(app)
      .put("/students/2")
      .send({ email: "alice@example.com" });
    expect(res.statusCode).toBe(400);
    res = await request(app).put("/students/999").send({ name: "NonExistent" });
    expect(res.statusCode).toBe(404);
  });
});

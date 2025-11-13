const storage = require("../services/storage");

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Liste des cours
 *     parameters:
 *       - name: title
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrer par titre
 *       - name: teacher
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrer par enseignant
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de résultats par page
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 */
exports.listCourses = (req, res) => {
  let courses = storage.list("courses");
  const { title, teacher, page = 1, limit = 10 } = req.query;
  if (title) courses = courses.filter((c) => c.title.includes(title));
  if (teacher) courses = courses.filter((c) => c.teacher.includes(teacher));
  const start = (page - 1) * limit;
  const paginated = courses.slice(start, start + Number(limit));
  res.json({ courses: paginated, total: courses.length });
};

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Récupérer un cours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *                 students:
 *                   type: array
 *       404:
 *         description: Non trouvé
 */
exports.getCourse = (req, res) => {
  const course = storage.get("courses", req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  const students = storage.getCourseStudents(req.params.id);
  return res.json({ course, students });
};

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Créer un cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               teacher:
 *                 type: string
 *             required:
 *               - title
 *               - teacher
 *     responses:
 *       201:
 *         description: Créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Paramètres invalides
 */
exports.createCourse = (req, res) => {
  const { title, teacher } = req.body;
  if (!title || !teacher)
    return res.status(400).json({ error: "title and teacher required" });
  const created = storage.create("courses", { title, teacher });
  return res.status(201).json(created);
};

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Supprimer un cours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Supprimé
 *       404:
 *         description: Non trouvé
 */
exports.deleteCourse = (req, res) => {
  const result = storage.remove("courses", req.params.id);
  if (result === false)
    return res.status(404).json({ error: "Course not found" });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(204).send();
};

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Mettre à jour un cours
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               teacher:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Non trouvé
 *       400:
 *         description: Erreur de validation
 */
exports.updateCourse = (req, res) => {
  const course = storage.get("courses", req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  const { title, teacher } = req.body;
  if (
    title &&
    storage.list("courses").find((c) => c.title === title && c.id !== course.id)
  ) {
    return res.status(400).json({ error: "Course title must be unique" });
  }
  if (title) course.title = title;
  if (teacher) course.teacher = teacher;
  return res.json(course);
};

const s = require("../services/storage");

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Liste des étudiants
 *     parameters:
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrer par nom
 *       - name: email
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrer par email
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
 *                 students:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 */
exports.listStudents = (req, res) => {
  let students = s.list("students");
  const { name, email, page = 1, limit = 10 } = req.query;
  if (name) students = students.filter((st) => st.name.includes(name));
  if (email) students = students.filter((st) => st.email.includes(email));
  const start = (page - 1) * limit;
  const paginated = students.slice(start, start + Number(limit));
  res.json({ students: paginated, total: students.length });
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Récupérer un étudiant
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
 *                 student:
 *                   type: object
 *                 courses:
 *                   type: array
 *       404:
 *         description: Non trouvé
 */
exports.getStudent = (req, res) => {
  const student = s.get("students", req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const courses = s.getStudentCourses(req.params.id);
  return res.json({ student, courses });
};

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Créer un étudiant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - name
 *               - email
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
exports.createStudent = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "name and email required" });
  const result = s.create("students", { name, email });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(201).json(result);
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Supprimer un étudiant
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
exports.deleteStudent = (req, res) => {
  const result = s.remove("students", req.params.id);
  if (result === false)
    return res.status(404).json({ error: "Student not found" });
  if (result.error) return res.status(400).json({ error: result.error });
  return res.status(204).send();
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Mettre à jour un étudiant
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
 *               name:
 *                 type: string
 *               email:
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
exports.updateStudent = (req, res) => {
  const student = s.get("students", req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const { name, email } = req.body;
  if (
    email &&
    s.list("students").find((st) => st.email === email && st.id !== student.id)
  ) {
    return res.status(400).json({ error: "Email must be unique" });
  }
  if (name) student.name = name;
  if (email) student.email = email;
  return res.json(student);
};

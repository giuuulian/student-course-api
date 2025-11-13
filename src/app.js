const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const x = require("./routes/students");
const y = require("./routes/courses");
const storage = require("./services/storage");

const app = express();
app.use(express.json());

storage.seed();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "StudentCourseAPI",
      version: "1.0.0",
      description: "API pour gérer les étudiants et les cours"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur local"
      }
    ]
  },
  apis: ["./src/controllers/*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/students", x);
app.use("/courses", y);

app.use((_req, res, _next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

if (require.main === module) {
  const p = process.env.PORT || 3000;
  app.listen(p, () => {
    console.log(`Server listening on port ${p}`);
  });
}

module.exports = app;

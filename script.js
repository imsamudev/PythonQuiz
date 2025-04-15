// Voy a dejar comentarios en el desarrollo del script para mejor comprensión. Con fines educativos para desarrolladores iniciales

// alojo las preguntas y respuestas en un .json aparte. Usando fetch en la función loadQuestions, de forma asincrónica extraemos las preguntas, opciones y respuestas
let questions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let userResponses = [];

// cargo el JSON desde el archivo específico
async function loadQuestions(file) {
  const response = await fetch(file);
  questions = await response.json();
  selectRandomQuestions();
  displayQuestion(selectedQuestions[currentQuestionIndex]);
}

// selecciono 10 preguntas del conjunto grande JSON, se hace copia del array para evitar mutaciones no deseadas
function selectRandomQuestions() {
  const shuffled = shuffleArray([...questions]);
  selectedQuestions = shuffled.slice(0, 10);
}

// desordenar un array, es decir en este caso las opciones (te dejo data de color para investigar: Fisher Yates shuffle, estoy seguro de que te servirá)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// mostrar pregunta y sus opciones
function displayQuestion(questionObj) {
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");

  // aplico replace para los saltos de línea en las preguntas
  const formattedQuestion = questionObj.question.replace(/\n/g, "<br>");

  // animaciones a los elementos de preguntas y opciones
  questionElement.classList.remove("fade-in");
  questionElement.classList.add("fade-out");
  optionsElement.classList.remove("fade-in");
  optionsElement.classList.add("fade-out");

  setTimeout(() => {
    questionElement.innerHTML = formattedQuestion;
    optionsElement.innerHTML = "";

    // desordenar las opciones delegando la tarea a la función shuffleArray anterior
    const shuffledOptions = shuffleArray([...questionObj.options]);

    shuffledOptions.forEach((option) => {
      const optionElement = document.createElement("button");
      optionElement.textContent = option;
      optionElement.addEventListener("click", () =>
        checkAnswer(option, questionObj.answer)
      );
      optionsElement.appendChild(optionElement);
    });

    questionElement.classList.remove("fade-out");
    questionElement.classList.add("fade-in");
    optionsElement.classList.remove("fade-out");
    optionsElement.classList.add("fade-in");
  }, 300);
}

// verifico respuesta seleccionada por usuario
function checkAnswer(selectedAnswer, correctAnswer) {
  userResponses.push({
    question: selectedQuestions[currentQuestionIndex].question,
    userAnswer: selectedAnswer,
    correctAnswer: correctAnswer,
  });

  // siguiente pregunta
  currentQuestionIndex++;
  if (currentQuestionIndex < selectedQuestions.length) {
    displayQuestion(selectedQuestions[currentQuestionIndex]);
  } else {
    showScore();
  }
}

// mostrar puntuación y respuestas
function showScore() {
  const scoreElement = document.getElementById("score");
  const tableElement = document.getElementById("responseTable");
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");

  questionElement.classList.remove("fade-in");
  questionElement.classList.add("fade-out");
  optionsElement.classList.remove("fade-in");
  optionsElement.classList.add("fade-out");

  setTimeout(() => {
    questionElement.textContent = "";
    optionsElement.innerHTML = "";

    let correctCount = 0;

    userResponses.forEach((response) => {
      if (response.userAnswer === response.correctAnswer) {
        correctCount++;
      }

      const row = tableElement.insertRow();
      row.insertCell(0).textContent = response.question;
      row.insertCell(1).textContent = response.userAnswer;
      row.insertCell(2).textContent = response.correctAnswer;
    });

    const percentage = (correctCount / selectedQuestions.length) * 100;
    scoreElement.textContent = `Puntuación final: ${correctCount}/${
      selectedQuestions.length
    } respuestas correctas (${percentage.toFixed(2)}%).`;

    // mostrar la tabla de respuestas
    tableElement.style.display = "block";

    // mostrar la sección de corrección
    const correctionAccordion = document.getElementById("correctionAccordion");
    const toggleAccordionButton = document.getElementById("toggleAccordion");

    // eliminar cualquier evento previo para evitar duplicados
    toggleAccordionButton.replaceWith(toggleAccordionButton.cloneNode(true));
    const newToggleAccordionButton = document.getElementById("toggleAccordion");

    // asociar el evento al botón nuevamente
    newToggleAccordionButton.addEventListener("click", () => {
      if (correctionAccordion.style.display === "none") {
        correctionAccordion.style.display = "block";
      } else {
        correctionAccordion.style.display = "none";
      }
    });

    // mostrar acordeón de corrección
    correctionAccordion.style.display = "none";

    const correctionElement = document.getElementById("correction");
    correctionElement.style.display = "block";

    // para iterar sobre una lista de respuestas de usuario y generar un resumen de correcciones para aquellas respuestas incorrectas

    userResponses.forEach((response) => {
      if (response.userAnswer !== response.correctAnswer) {
        const correctionItem = document.createElement("div");
        correctionItem.innerHTML = `
        <div id="item">
          <p class="correctionText"><strong>Pregunta:</strong> ${
            response.question
          }</p>
          <p class="correctionText"><strong>Respuesta seleccionada:</strong> ${
            response.userAnswer
          }</p>
          <p class="correctionText"><strong>Respuesta correcta:</strong> ${
            response.correctAnswer
          }</p>
          <p class="correctionText"><strong>Explicación:</strong> ${
            questions.find(
              (question) => question.question === response.question
            ).explanation
          }</p>
        </div>
        `;
        correctionAccordion.appendChild(correctionItem);
      }
    });

    // mostrar el botón "Reintentar" al final del quiz
    const retryContainer = document.getElementById("retryContainer");
    retryContainer.style.display = "block";
  }, 800);
}

// función para reiniciar el quiz
function resetQuiz() {
  // reiniciar variables
  questions = [];
  selectedQuestions = [];
  currentQuestionIndex = 0;
  userResponses = [];

  // ocultar elementos del quiz
  document.getElementById("score").textContent = "";
  document.getElementById("responseTable").style.display = "none";
  document.getElementById("correction").style.display = "none";
  document.getElementById("retryContainer").style.display = "none";

  // limpiar tabla de respuestas y correcciones
  const tableElement = document.getElementById("responseTable");
  while (tableElement.rows.length > 1) {
    tableElement.deleteRow(1);
  }

  const correctionAccordion = document.getElementById("correctionAccordion");
  correctionAccordion.innerHTML = "";

  // reiniciar animaciones y estados
  const levelSelection = document.getElementById("levelSelection");
  levelSelection.style.display = "none"; // Asegurarse de que esté oculto
  levelSelection.classList.remove("fade-in", "fade-out");

  // mostrar el modal inicial de bienvenida
  const modal = document.getElementById("introModal");
  modal.style.display = "flex";
}

// agrego función para modal
document.addEventListener("DOMContentLoaded", (event) => {
  const retryButton = document.getElementById("retryButton");

  // asociar evento al botón "Reintentar"
  retryButton.addEventListener("click", resetQuiz);

  const modal = document.getElementById("introModal");
  const levelSelection = document.getElementById("levelSelection");
  const startQuiz = document.getElementById("startQuiz");

  modal.style.display = "flex";

  // al pulsar el logo muestro la selección del nivel
  startQuiz.onclick = function () {
    const modal = document.getElementById("introModal");
    const levelSelection = document.getElementById("levelSelection");

    // ocultar el modal inicial
    modal.style.display = "none";

    // animaciones
    levelSelection.classList.remove("fade-in", "fade-out");
    levelSelection.style.display = "block";
    levelSelection.classList.add("fade-in");
  };

  const startBeginnerQuiz = document.getElementById("startBeginnerQuiz");
  const startIntermediateQuiz = document.getElementById(
    "startIntermediateQuiz"
  );

  // nivel principiante
  startBeginnerQuiz.onclick = function () {
    levelSelection.classList.remove("fade-in");
    levelSelection.classList.add("fade-out");
    setTimeout(() => {
      levelSelection.style.display = "none";
      startQuizFunction("questions.json");
    }, 1000);
  };

  // nivel intermedio
  startIntermediateQuiz.onclick = function () {
    levelSelection.classList.remove("fade-in");
    levelSelection.classList.add("fade-out");
    setTimeout(() => {
      levelSelection.style.display = "none";
      startQuizFunction("questions_intermediate-level.json");
    }, 1000);
  };
});

function startQuizFunction(file) {
  console.log("¡Empieza el Quizz! Gracias por revisar la consola compañero ;)");
  loadQuestions(file);
}

// los archivos JSON fueron creados completamente por IA, para yo disfrutar del desafío también :D
// espero te haya servido los comentarios, cualquier duda consúltame!

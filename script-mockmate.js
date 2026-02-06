let questions = [];
let currentQuestion = 0;
let answers = [];
let statuses = [];
let timeInSeconds = 10800;
let currentLanguage = "hi";
let testSubmitted = false;

/* ================= GET SELECTED PAPER ================= */
function getSelectedPaper() {
    const params = new URLSearchParams(window.location.search);
  return params.get("paper");
}

/* ================= PAPER → JSON MAP ================= */
const paperMap = {
    "mppsc2024_paper1": "/EXAM PAPERS/MPPSC/PAPER01-2024/PAPER-01-2024.json",
    "mppsc2024_paper2": "/EXAM PAPERS/MPPSC/PAPER02-2024/PAPER-02-2024.json",
    "mppsc2023_paper1": "/EXAM PAPERS/MPPSC/PAPER01-2023/PAPER-01-2023.json",
};


/* ================= FETCH QUESTIONS (DYNAMIC) ================= */
const selectedPaper = getSelectedPaper();

if (!selectedPaper || !paperMap[selectedPaper]) {
    alert("Invalid or missing test paper. Please select a test again.");
    window.location.href = "/index.html";
} else {
    fetch(paperMap[selectedPaper])
        .then(res => res.json())
        .then(data => {
            questions = data;
            answers = Array(questions.length).fill(null);
            statuses = Array(questions.length).fill("not-visited");
            buildPalette();
            renderQuestion(0);
        })
        .catch(err => {
            console.error("Error loading questions:", err);
            alert("Failed to load test questions.");
        });
}

/* ================= TIMER ================= */
let timerInterval = setInterval(() => {
    let min = Math.floor(timeInSeconds / 60);
    let sec = timeInSeconds % 60;

    document.getElementById("timer").textContent =
        `${min}:${sec < 10 ? "0" + sec : sec}`;

    if (timeInSeconds > 0) {
        timeInSeconds--;
    } else {
        clearInterval(timerInterval);
        submitTest();
    }
}, 1000);

/* ================= LANGUAGE TOGGLE ================= */
document.getElementById("lang-toggle-btn").onclick = () => {
    currentLanguage = currentLanguage === "hi" ? "en" : "hi";
    document.getElementById("lang-toggle-btn").textContent =
        currentLanguage === "hi" ? "English" : "हिन्दी";
    renderQuestion(currentQuestion);
};

/* ================= RENDER QUESTION ================= */
function renderQuestion(index) {
    document.getElementById("question-number").textContent =
        `Question No ${index + 1}`;

    let q = questions[index];
    let questionText =
        currentLanguage === "hi" ? q.question_hi : q.question_en;
    let optionsArray =
        currentLanguage === "hi" ? q.options_hi : q.options_en;

    let imageHTML = q.image
        ? `<img src="${q.image}" class="img-fluid rounded mb-2" style="max-height:240px;">`
        : "";

    document.getElementById("question-text").innerHTML =
        `<b>${questionText}</b><br>${imageHTML}`;

    let html = "";
    optionsArray.forEach((opt, i) => {
        html += `
            <div class="form-check">
                <input class="form-check-input" type="radio"
                    name="option" id="opt${i}" value="${i}"
                    ${answers[index] === i ? "checked" : ""}>
                <label class="form-check-label" for="opt${i}">
                    ${opt}
                </label>
            </div>
        `;
    });

    document.getElementById("options-container").innerHTML = html;
    updatePalette();
}

/* ================= QUESTION PALETTE ================= */
function buildPalette() {
    const palette = document.getElementById("question-palette");
    palette.innerHTML = "";

    questions.forEach((_, i) => {
        let box = document.createElement("div");
        box.className = "q-box not-visited";
        box.textContent = i + 1;

        box.onclick = () => {
            currentQuestion = i;
            if (statuses[i] === "not-visited")
                statuses[i] = "not-answered";
            renderQuestion(i);
        };

        palette.appendChild(box);
    });
}

function updatePalette() {
    document.querySelectorAll("#question-palette .q-box")
        .forEach((box, i) => {
            box.className = `q-box ${statuses[i]}`;
        });
}

/* ================= SAVE ANSWER ================= */
function saveAnswer(markReview = false) {
    let selected =
        document.querySelector('input[name="option"]:checked');

    if (selected) {
        answers[currentQuestion] = parseInt(selected.value);
        statuses[currentQuestion] =
            markReview ? "answered-marked-review" : "answered";
    } else {
        statuses[currentQuestion] =
            markReview ? "marked-review" : "not-answered";
    }
}

/* ================= NAVIGATION ================= */
document.getElementById("save-next").onclick = () => {
    saveAnswer(false);
    nextQuestion();
};

document.getElementById("save-mark-review").onclick = () => {
    saveAnswer(true);
    nextQuestion();
};

document.getElementById("mark-review-next").onclick = () => {
    statuses[currentQuestion] = "marked-review";
    nextQuestion();
};

document.getElementById("clear").onclick = () => {
    answers[currentQuestion] = null;
    statuses[currentQuestion] = "not-answered";
    renderQuestion(currentQuestion);
};

document.getElementById("next").onclick = nextQuestion;

document.getElementById("back").onclick = () => {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion(currentQuestion);
    }
};

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        if (statuses[currentQuestion] === "not-visited")
            statuses[currentQuestion] = "not-answered";
        renderQuestion(currentQuestion);
    }
}

/* ================= SUBMIT ================= */
document.getElementById("submit").onclick = () => {
    if (confirm("Are you sure you want to submit the test?")) {
        submitTest();
    }
};

function submitTest() {
    if (testSubmitted) return;
    testSubmitted = true;

    clearInterval(timerInterval);

    let score = 0;
    let submissionTime =
        document.getElementById("timer").textContent;

    questions.forEach((q, i) => {
        if (answers[i] !== null) {
            if (answers[i] === q.correct_option_index) {
                score++;
                statuses[i] = "correct";
            } else {
                statuses[i] = "wrong";
            }
        } else {
            statuses[i] = "not-answered-final";
        }
    });

    document.querySelector(".col-lg-4").innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <h6>Score: ${score}/${questions.length}</h6>
                <p>Submitted at: ${submissionTime}</p>
                <hr>
                <h6>Question Palette</h6>
                <div id="result-palette" class="palette-scroll"></div>
            </div>
        </div>
    `;

    const resultPalette =
        document.getElementById("result-palette");

    statuses.forEach((st, i) => {
        let box = document.createElement("div");
        box.className = "result-box";
        box.textContent = i + 1;

        if (st === "correct")
            box.classList.add("result-correct");
        else if (st === "wrong")
            box.classList.add("result-wrong");
        else
            box.classList.add("result-not-answered");

        box.onclick = () => {
            document
                .querySelectorAll(".result-box")
                .forEach(b => b.classList.remove("result-active"));

            box.classList.add("result-active");
            renderReviewQuestion(i);
        };

        resultPalette.appendChild(box);
    });

    document.querySelector(".action-buttons").style.display = "none";
    document.querySelector(".nav-buttons").style.display = "none";

    document.querySelector(".result-box").classList.add("result-active");
    renderReviewQuestion(0);
}

/* ================= REVIEW MODE ================= */
function renderReviewQuestion(index) {
    currentQuestion = index;

    let q = questions[index];
    let opts =
        currentLanguage === "hi" ? q.options_hi : q.options_en;
    let qText =
        currentLanguage === "hi" ? q.question_hi : q.question_en;

    document.getElementById("question-number").textContent =
        `Question No ${index + 1} (Review Mode)`;

    document.getElementById("question-text").innerHTML =
        `<b>${qText}</b>`;

    let html = "";
    opts.forEach((opt, i) => {
        let cls = "form-check-label";

        if (i === q.correct_option_index)
            cls += " bg-success text-white";
        else if (i === answers[index])
            cls += " bg-danger text-white";

        html += `
            <div class="form-check">
                <input type="radio" disabled
                    ${answers[index] === i ? "checked" : ""}>
                <label class="${cls}">${opt}</label>
            </div>
        `;
    });

    document.getElementById("options-container").innerHTML = html;
}

/* ================= PROCTORING ================= */
document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("visibilitychange", () => {
    if (document.hidden && !testSubmitted) {
        alert("Tab switch detected. Test auto-submitted.");
        submitTest();
    }
});

document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        if (!testSubmitted) {
            alert("Copying not allowed. Test submitted.");
            submitTest();
        }
    }
});

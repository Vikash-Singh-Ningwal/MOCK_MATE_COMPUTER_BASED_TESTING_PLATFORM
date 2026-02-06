/* ================= TEST DATA ================= */
const tests = [
    {
        id: "mppsc2024_paper1",
        title: "MPPSC 2024 – Paper 1",
        description: "General Studies (Prelims)",
        url: "/MockMate.html?paper=mppsc2024_paper1"
    },
    {
        id: "mppsc2024_paper2",
        title: "MPPSC 2024 – Paper 2",
        description: "CSAT (Prelims)",
        url: "/MockMate.html?paper=mppsc2024_paper2"
        
    },
    {
         id: "mppsc2023_paper1",
        title: "MPPSC 2023 – Paper 1",
        description: "General Studies (Prelims)",
        url: "/MockMate.html?paper=mppsc2023_paper1"
        
    }
];


let selectedTest = null;

/* ================= RENDER TESTS ================= */
const grid = document.getElementById("testGrid");

tests.forEach(test => {
    const card = document.createElement("div");
    card.className = "test-card";
    card.innerHTML = `
        <h3>${test.title}</h3>
        <p>${test.description}</p>
    `;

    card.onclick = () => {
        document
            .querySelectorAll(".test-card")
            .forEach(c => c.classList.remove("active"));

        card.classList.add("active");
        selectedTest = test;
        document.getElementById("startBtn").disabled = false;
    };

    grid.appendChild(card);
});

/* ================= START TEST ================= */
document.getElementById("startBtn").onclick = () => {
    if (!selectedTest) return;
    window.location.href = selectedTest.url;
};

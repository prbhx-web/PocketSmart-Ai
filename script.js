// =====================================================
// Pocket Smart AI - Main JavaScript
// Smart Budget & Recommendation Assistant
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeBudgetForm();
    initializeExpenseForm();
    initializeAnimations();
    initializeButtons();
    updateBudgetProgress();
});

let totalBudget = 0;
let totalSpent = 0;

// =====================================================
// Budget Form
// =====================================================

function initializeBudgetForm() {
    const budgetForm = document.getElementById("budget-form");

    if (!budgetForm) return;

    budgetForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const income = Number(document.getElementById("income").value);

        if (income <= 0) {
            showMessage("Enter a valid monthly income.", "error");
            return;
        }

        totalBudget = income;
        totalSpent = 0;

        updateBudgetProgress();
        showMessage("Monthly budget has been created.", "success");
    });
}

// =====================================================
// Expense Form
// =====================================================

function initializeExpenseForm() {
    const expenseForm = document.getElementById("expense-form");

    if (!expenseForm) return;

    expenseForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const category = document.getElementById("category").value;
        const amount = Number(document.getElementById("amount").value);

        if (!category || amount <= 0) {
            showMessage("Enter valid expense details.", "error");
            return;
        }

        totalSpent += amount;
        updateBudgetProgress();
        addExpenseRow(category, amount);

        showLoading("Generating AI recommendation...");

        try {
            await getAIRecommendation(category, amount);
        } catch {
            showMessage("Could not generate recommendation.", "error");
        }

        expenseForm.reset();
    });
}

// =====================================================
// Budget Progress
// =====================================================

function updateBudgetProgress() {
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0
        ? Math.min((totalSpent / totalBudget) * 100, 100)
        : 0;

    const spentElement = document.getElementById("spent");
    const remainingElement = document.getElementById("remaining");
    const progressBar = document.getElementById("progress-bar");

    if (spentElement) spentElement.textContent = `₹${totalSpent.toFixed(2)}`;
    if (remainingElement) remainingElement.textContent = `₹${remaining.toFixed(2)}`;

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;

        if (percentage >= 90) {
            progressBar.style.background = "#ef4444";
        } else if (percentage >= 70) {
            progressBar.style.background = "#f59e0b";
        } else {
            progressBar.style.background = "#22c55e";
        }
    }
}

// =====================================================
// Expense Table
// =====================================================

function addExpenseRow(category, amount) {
    const tableBody = document.getElementById("expense-table-body");

    if (!tableBody) return;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${category}</td>
        <td>₹${amount.toFixed(2)}</td>
    `;

    tableBody.prepend(row);
}

// =====================================================
// AI Recommendation
// =====================================================

async function getAIRecommendation(category, amount) {

    const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            category,
            amount,
            total_budget: totalBudget,
            total_spent: totalSpent
        })
    });

    if (!response.ok) {
        throw new Error("API error");
    }

    const data = await response.json();

    const recommendation = document.getElementById("ai-recommendation");

    if (recommendation) {
        recommendation.textContent =
            data.recommendation || "No recommendation available.";
    }

    hideLoading();
}

// =====================================================
// Loading Indicator
// =====================================================

function showLoading(message = "Thinking...") {
    const loading = document.getElementById("loading");

    if (loading) {
        loading.style.display = "block";
        loading.textContent = message;
    }
}

function hideLoading() {
    const loading = document.getElementById("loading");

    if (loading) {
        loading.style.display = "none";
    }
}

// =====================================================
// Messages
// =====================================================

function showMessage(message, type = "info") {

    let box = document.getElementById("message-box");

    if (!box) {
        box = document.createElement("div");
        box.id = "message-box";
        document.body.prepend(box);
    }

    box.className = `message ${type}`;
    box.textContent = message;

    setTimeout(() => {
        box.textContent = "";
        box.className = "";
    }, 3000);
}

// =====================================================
// Animations
// =====================================================

function initializeAnimations() {

    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {
            card.style.transition =
                "opacity 0.5s ease, transform 0.5s ease";

            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 120);
    });
}

// =====================================================
// Buttons
// =====================================================

function initializeButtons() {

    const printButton = document.getElementById("print-report");

    if (printButton) {
        printButton.addEventListener("click", () => {
            window.print();
        });
    }

    const copyButton = document.getElementById("copy-recommendation");

    if (copyButton) {
        copyButton.addEventListener("click", copyRecommendation);
    }

    const resetButton = document.getElementById("reset-budget");

    if (resetButton) {
        resetButton.addEventListener("click", resetBudget);
    }
}

// =====================================================
// Copy AI Recommendation
// =====================================================

function copyRecommendation() {

    const text = document.getElementById("ai-recommendation")?.innerText;

    if (!text) return;

    navigator.clipboard.writeText(text)
        .then(() => {
            showMessage("Recommendation copied.", "success");
        })
        .catch(() => {
            showMessage("Copy failed.", "error");
        });
}

// =====================================================
// Reset Budget
// =====================================================

function resetBudget() {

    totalBudget = 0;
    totalSpent = 0;

    updateBudgetProgress();

    const tableBody = document.getElementById("expense-table-body");

    if (tableBody) {
        tableBody.innerHTML = "";
    }

    const recommendation = document.getElementById("ai-recommendation");

    if (recommendation) {
        recommendation.textContent =
            "Your AI savings recommendation will appear here.";
    }

    showMessage("Budget has been reset.", "success");
}

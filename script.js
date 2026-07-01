// ELEMENTS
const loginPage = document.getElementById("loginPage");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const themeToggle = document.getElementById("themeToggle");
const exportBtn = document.getElementById("exportBtn");
const leadForm = document.getElementById("leadForm");
const leadTableBody = document.getElementById("leadTableBody");
const mobileLeadCards = document.getElementById("mobileLeadCards");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let leads = JSON.parse(localStorage.getItem("leads")) || [];
let currentFilter = "All";

// LOGIN
loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "apex123") {
        loginPage.style.display = "none";
        dashboard.classList.remove("hidden");
        renderLeads();
    } else {
        alert("Invalid credentials.");
    }
});

// LOGOUT
logoutBtn.addEventListener("click", () => {
    dashboard.classList.add("hidden");
    loginPage.style.display = "flex";
});

// DARK MODE
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    themeToggle.textContent =
        document.body.classList.contains("light-mode") ? "☀️" : "🌙";
});

// ADD LEAD
leadForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("leadName").value.trim();
    const email = document.getElementById("leadEmail").value.trim();
    const source = document.getElementById("leadSource").value;
    const status = document.getElementById("leadStatus").value;
    const notes = document.getElementById("leadNotes").value.trim();

    if (!name || !email || !source) {
        alert("Please fill all required fields.");
        return;
    }

    const lead = { name, email, source, status, notes };
    leads.push(lead);

    saveLeads();
    leadForm.reset();
    renderLeads();
});

// SAVE TO STORAGE
function saveLeads() {
    localStorage.setItem("leads", JSON.stringify(leads));
}

// DELETE LEAD
function deleteLead(index) {
    leads.splice(index, 1);
    saveLeads();
    renderLeads();
}

// UPDATE STATUS
function updateStatus(index, newStatus) {
    leads[index].status = newStatus;
    saveLeads();
    renderLeads();
}

// RENDER
function renderLeads() {
    leadTableBody.innerHTML = "";
    mobileLeadCards.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase();

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchTerm) ||
            lead.email.toLowerCase().includes(searchTerm);

        const matchesFilter =
            currentFilter === "All" || lead.status === currentFilter;

        return matchesSearch && matchesFilter;
    });

    filteredLeads.forEach((lead, index) => {
        // TABLE ROW
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.source}</td>
            <td>
                <select onchange="updateStatus(${index}, this.value)">
                    <option ${lead.status === "New" ? "selected" : ""}>New</option>
                    <option ${lead.status === "Contacted" ? "selected" : ""}>Contacted</option>
                    <option ${lead.status === "Converted" ? "selected" : ""}>Converted</option>
                </select>
            </td>
            <td>${lead.notes}</td>
            <td>
                <button onclick="deleteLead(${index})">Delete</button>
            </td>
        `;
        leadTableBody.appendChild(row);

        // MOBILE CARD
        const card = document.createElement("div");
        card.classList.add("lead-card");
        card.innerHTML = `
            <h3>${lead.name}</h3>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Source:</strong> ${lead.source}</p>
            <p><strong>Status:</strong> ${lead.status}</p>
            <p><strong>Notes:</strong> ${lead.notes}</p>
            <button onclick="deleteLead(${index})">Delete</button>
        `;
        mobileLeadCards.appendChild(card);
    });

    updateStats();
}

// STATS
function updateStats() {
    document.getElementById("totalLeads").textContent = leads.length;
    document.getElementById("newLeads").textContent =
        leads.filter(l => l.status === "New").length;
    document.getElementById("contactedLeads").textContent =
        leads.filter(l => l.status === "Contacted").length;
    document.getElementById("convertedLeads").textContent =
        leads.filter(l => l.status === "Converted").length;
}

// SEARCH
searchInput.addEventListener("input", renderLeads);

// FILTERS
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
        renderLeads();
    });
});

// EXPORT CSV
exportBtn.addEventListener("click", () => {
    if (leads.length === 0) {
        alert("No leads to export.");
        return;
    }

    let csv = "Name,Email,Source,Status,Notes\n";

    leads.forEach(lead => {
        csv += `${lead.name},${lead.email},${lead.source},${lead.status},"${lead.notes}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "apex_leads.csv";
    a.click();
});
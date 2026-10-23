
const internshipList = document.getElementById("internship-list");
const searchInput = document.getElementById("search");
const domainSelect = document.getElementById("domain");
const modeSelect = document.getElementById("mode");
const clearButton = document.getElementById("clear-filters");
const retryButton = document.getElementById("retry-button");
const statusText = document.getElementById("status");

let internships = [];

async function loadInternships() {
    statusText.textContent = "Loading internships...";
    retryButton.hidden = true;
    internshipList.replaceChildren();

    try {
        const response = await fetch("internships.json");

        if (!response.ok) {
            throw new Error("Failed to load internship data");
        }

        const data = await response.json();

        if (
            !data ||
            !Array.isArray(data.internships) ||
            !data.internships.every(item =>
                item &&
                item.id &&
                item.title &&
                item.domain &&
                item.mode &&
                item.location &&
                Array.isArray(item.skills)
            )
        ) {
            throw new Error("Invalid internship data format");
        }

        internships = data.internships;

        loadDomains();
        displayInternships();
    } catch (error) {
        internshipList.replaceChildren();
        statusText.textContent =
            "Unable to load internships. Please try again.";
        retryButton.hidden = false;

        console.error("Internship loading error:", error);
    }
}

function loadDomains() {
    const currentDomain = domainSelect.value;

    domainSelect.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Domains";
    domainSelect.appendChild(allOption);

    const domains = [
        ...new Set(internships.map(item => item.domain))
    ].sort();

    domains.forEach(domain => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        domainSelect.appendChild(option);
    });

    domainSelect.value = domains.includes(currentDomain)
        ? currentDomain
        : "";
}

function displayInternships() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedDomain = domainSelect.value;
    const selectedMode = modeSelect.value;

    const filteredInternships = internships.filter(item => {
        const searchableContent = [
            item.title,
            item.domain,
            item.mode,
            item.location,
            ...item.skills
        ].join(" ").toLowerCase();

        const matchesSearch = searchableContent.includes(searchText);
        const matchesDomain =
            selectedDomain === "" || item.domain === selectedDomain;
        const matchesMode =
            selectedMode === "" || item.mode === selectedMode;

        return matchesSearch && matchesDomain && matchesMode;
    });

    internshipList.replaceChildren();

    if (filteredInternships.length === 0) {
        statusText.textContent =
            "No internships found. Try another search or clear the filters.";
        return;
    }

    statusText.textContent =
        `${filteredInternships.length} internship(s) found.`;

    filteredInternships.forEach(item => {
        const card = document.createElement("article");
        card.className = "card";

        const title = document.createElement("h3");
        title.textContent = item.title;

        const domain = document.createElement("p");
        domain.textContent = `Domain: ${item.domain}`;

        const mode = document.createElement("p");
        mode.textContent = `Work mode: ${item.mode}`;

        const location = document.createElement("p");
        location.textContent = `Location: ${item.location}`;

        const skills = document.createElement("p");
        skills.append("Skills: ");

        item.skills.forEach(skill => {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = skill;
            skills.appendChild(tag);
        });

        const openings = document.createElement("p");
        openings.textContent = `Openings: ${item.openings ?? "Not specified"}`;

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.textContent = "View details";
        detailsButton.setAttribute(
            "aria-label",
            `View details for ${item.title}`
        );

        detailsButton.addEventListener("click", () => {
            const details = [
                `Internship ID: ${item.id}`,
                `Title: ${item.title}`,
                `Domain: ${item.domain}`,
                `Work mode: ${item.mode}`,
                `Location: ${item.location}`,
                `Skills: ${item.skills.join(", ")}`,
                `Openings: ${item.openings ?? "Not specified"}`
            ];

            window.alert(details.join("\n"));
        });

        card.append(
            title,
            domain,
            mode,
            location,
            skills,
            openings,
            detailsButton
        );

        internshipList.appendChild(card);
    });
}

searchInput.addEventListener("input", displayInternships);
domainSelect.addEventListener("change", displayInternships);
modeSelect.addEventListener("change", displayInternships);

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    domainSelect.value = "";
    modeSelect.value = "";

    displayInternships();
});

retryButton.addEventListener("click", loadInternships);

loadInternships();


const internshipList = document.getElementById("internship-list");
const searchInput = document.getElementById("search");
const domainSelect = document.getElementById("domain");
const clearButton = document.getElementById("clear-filters");
const statusText = document.getElementById("status");

let internships = [];

async function loadInternships() {
    statusText.textContent = "Loading internships...";

    try {
        const response = await fetch("internships.json");

        if (!response.ok) {
            throw new Error("Failed to load internship data");
        }

        const data = await response.json();

        if (!Array.isArray(data.internships)) {
            throw new Error("Invalid internship data format");
        }

        internships = data.internships;

        loadDomains();
        displayInternships();

    } catch (error) {
        internshipList.replaceChildren();

        statusText.textContent =
            "Unable to load internships. Please check the data file and try again.";

        console.error(error);
    }
}

function loadDomains() {
    const domains = [
        ...new Set(internships.map(item => item.domain))
    ].sort();

    domains.forEach(domain => {
        const option = document.createElement("option");

        option.value = domain;
        option.textContent = domain;

        domainSelect.appendChild(option);
    });
}

function displayInternships() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedDomain = domainSelect.value;

    const filteredInternships = internships.filter(item => {
        const searchableContent = [
            item.title,
            item.domain,
            item.mode,
            item.location,
            ...(item.skills || [])
        ].join(" ").toLowerCase();

        const matchesSearch = searchableContent.includes(searchText);

        const matchesDomain =
            selectedDomain === "" || item.domain === selectedDomain;

        return matchesSearch && matchesDomain;
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
        skills.textContent = "Skills: ";

        (item.skills || []).forEach(skill => {
            const tag = document.createElement("span");
            tag.className = "tag";
            tag.textContent = skill;
            skills.appendChild(tag);
        });

        const openings = document.createElement("p");
        openings.textContent = `Openings: ${item.openings}`;

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.textContent = "View details";

        detailsButton.addEventListener("click", () => {
            statusText.textContent =
                `${item.title}. Domain: ${item.domain}. ` +
                `Mode: ${item.mode}. Location: ${item.location}.`;
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

clearButton.addEventListener("click", () => {
    searchInput.value = "";
    domainSelect.value = "";

    displayInternships();
});

loadInternships();

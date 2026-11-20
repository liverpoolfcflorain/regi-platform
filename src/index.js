const API_URL = import.meta.env.VITE_ACMUN_API_URL + "/api";

const COMMITTEE_OPTIONS = [
    "United Nations Security Council (UNSC)",
    "Bashar Al Assad's Cabinet (CRISIS)",
    "The Roman Consulate (RC)",
    "The Paris Peace Conference (PPC)",
    "The Sovereign Soviet Assembly (SSA)",
    "The Joint International Tribunal (JIT)",
    "United Nations Human Rights Committee (UNHRC)",
    "United Nations Office on Drugs and Crime (UNODC)",
    "Social, Humanitarian and Cultural Committee (SOCHUM)",
    "Pakistan National Assembly (PNA)"
];

/* ============================================================
   APPLICATION STATE
============================================================ */

let currentStep = 0;

const totalSteps = 7;

let selectedDelegateCount = 0;


const registrationData = {
    advisor: {},
    institution: {},
    delegation: {},
    totalDelegateCount: 0,
    headDelegate: {},
    delegates: [],
    preferences: {}
};


const steps = document.querySelectorAll(".step");

const nextButton = document.getElementById("nextButton");

const backButton = document.getElementById("backButton");

const progressFill = document.getElementById("progressFill");

const stepText = document.getElementById("stepText");

const progressPercent = document.getElementById("progressPercent");
const formNavigation = document.getElementById("formNavigation");
const formErrorSummary = document.getElementById("formErrorSummary");
const formSubmissionError = document.getElementById("formSubmissionError");
let submissionInProgress = false;

/* ============================================================
PAGE / SCREEN MANAGEMENT
============================================================ */

const loader = document.getElementById("loader");

const infoPage = document.getElementById("infoPage");

const registrationApp = document.querySelector(".app");

const beginRegistration =
    document.getElementById("beginRegistration");


console.info("ACMUN registration controller loaded.");

/* ============================================================
   INITIAL STATE
============================================================ */

/*
    Hide both the information page and registration form
    while the ACMUN loader is visible.
*/

if (infoPage) {
    infoPage.classList.remove("active");
}

if (registrationApp) {
    registrationApp.style.display = "none";
}


/* ============================================================
   LOADER
============================================================ */

function load() {



    if (!loader) {

        console.warn(
            "Loader not found. Opening information page."
        );

        showInformation();

        return;
    }


    /*
        Keep loader visible for 1.8 seconds.
    */

    setTimeout(() => {


        loader.classList.add("hide");


        /*
            Wait for the CSS fade-out animation
            before showing the information page.
        */

        setTimeout(() => {

            showInformation();

        }, 500);


    }, 1800);

}


/* ============================================================
   SHOW INFORMATION PAGE
============================================================ */

function showInformation() {

    if (registrationApp) {

        registrationApp.style.display = "none";

    }


    /*
        Show information page.
    */

    if (infoPage) {

        infoPage.classList.add("active");

    }


    /*
        Return user to top.
    */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* ============================================================
   SHOW REGISTRATION FORM
============================================================ */

function showRegistration() {

    console.log(
        "Opening registration form"
    );


    /*
        Hide ACMUN information page.
    */

    if (infoPage) {

        infoPage.classList.remove("active");

    }


    /*
        Show the existing registration form.
    */

    if (registrationApp) {

        registrationApp.style.display = "flex";

    }


    /* Return to the top of the form.
    */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    /*
        Ensure the registration starts
        from Step 1.
    */

    currentStep = 0;

    showStep(currentStep);

}


/* ============================================================
   BEGIN REGISTRATION BUTTON
============================================================ */

if (beginRegistration) {

    beginRegistration.addEventListener(
        "click",
        showRegistration
    );

} else {

    console.error(
        "Begin Registration button not found"
    );

}


/* ============================================================
   START APPLICATION
============================================================ */

load();




/* ============================================================
   STEP MANAGEMENT
============================================================ */

function showStep(index) {
    const target = Array.from(steps).find(step => Number(step.dataset.step) === index);

    if (!target) {
        console.error(`ACMUN: registration step ${index} was not found.`);
        return false;
    }

    currentStep = index;
    Array.from(steps).forEach(step => {
        step.classList.toggle("active", step === target);
    });

    if (index === 7) {
        if (formNavigation) formNavigation.classList.add("hidden");
        if (formErrorSummary) formErrorSummary.hidden = true;
        return true;
    }

    if (formNavigation) formNavigation.classList.remove("hidden");

    const percentage = Math.round(((index + 1) / totalSteps) * 100);
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressPercent) progressPercent.textContent = `${percentage}%`;
    if (stepText) stepText.textContent = `Step ${index + 1} of ${totalSteps}`;

    if (backButton) backButton.classList.toggle("hidden", index !== 0);

    if (nextButton) {
        const reviewStep = index === 6;
        nextButton.textContent = reviewStep ? "Submit Registration ✓" : "Continue →";
        nextButton.classList.toggle("btn-submit", reviewStep);
        nextButton.classList.toggle("btn-next", !reviewStep);
        nextButton.disabled = submissionInProgress;
        nextButton.removeAttribute("aria-busy");
    }

    if (formSubmissionError) formSubmissionError.hidden = true;
    if (formErrorSummary) formErrorSummary.hidden = true;
    return true;
}


/* ============================================================
   VALIDATION AND INLINE FIELD WARNINGS
============================================================ */

function showFormSummary(message) {
    if (!formErrorSummary) return;
    formErrorSummary.textContent = message;
    formErrorSummary.hidden = false;
}

function hideFormSummary() {
    if (!formErrorSummary) return;
    formErrorSummary.textContent = "";
    formErrorSummary.hidden = true;
}

function clearFieldError(control) {
    if (!control) return;

    const group = control.closest(".form-group");
    if (!group) return;

    let removedOwnError = false;
    group.querySelectorAll(".field-error").forEach(node => {
        if (node.dataset.for === control.id) {
            node.remove();
            removedOwnError = true;
        }
    });

    if (removedOwnError && !group.querySelector(".field-error, .content-error")) {
        control.classList.remove("field-flagged");
        control.removeAttribute("aria-invalid");
        control.removeAttribute("aria-describedby");
        group.classList.remove("has-error");
    }
}

function setFieldError(control, message) {
    const group = control.closest(".form-group");
    if (!group) return;

    clearFieldError(control);
    control.classList.add("field-flagged");
    control.setAttribute("aria-invalid", "true");
    group.classList.add("has-error");

    const error = document.createElement("div");
    error.className = "field-error";
    error.id = `${control.id}-error`;
    error.dataset.for = control.id;
    error.textContent = message;
    group.appendChild(error);
    control.setAttribute("aria-describedby", error.id || `${control.id}-error`);
}

function fieldErrorMessage(control) {
    const value = String(control.value ?? "").trim();

    if (control.required && !value) {
        return control.tagName === "SELECT"
            ? "Please select an option."
            : "This field is required.";
    }

    if (control.type === "email" && value && !control.validity.valid) {
        return "Please enter a valid email address.";
    }

    return "";
}

function clearStepErrors(stepElement) {
    stepElement.querySelectorAll("input, select, textarea").forEach(clearFieldError);

    if (Number(stepElement.dataset.step) === 2) {
        const countError = document.getElementById("delegateCountError");
        const group = countError?.closest(".form-group");
        if (countError) {
            countError.textContent = "";
            countError.classList.add("hidden");
        }
        if (group && !group.querySelector(".field-error, .content-error")) {
            group.classList.remove("has-error");
        }
    }
}

function validateStepElement(stepElement) {
    if (!stepElement) return { valid: false, count: 1, firstInvalid: null };

    clearStepErrors(stepElement);
    let errorCount = 0;
    let firstInvalid = null;

    const requiredControls = stepElement.querySelectorAll(
        'input[required]:not([type="radio"]):not([type="checkbox"]), select[required], textarea[required]'
    );

    requiredControls.forEach(control => {
        const message = fieldErrorMessage(control);
        if (!message) return;

        setFieldError(control, message);
        errorCount += 1;
        if (!firstInvalid) firstInvalid = control;
    });

    // Radio values 7-11 represent 7-11 additional delegates; the head delegate
    // makes the total delegation size 8-12. Check for a selection before reading it.
    if (Number(stepElement.dataset.step) === 2) {
        const selected = stepElement.querySelector('input[name="delegateCount"]:checked');
        const countError = document.getElementById("delegateCountError");
        const countGroup = countError?.closest(".form-group");

        if (!selected) {
            if (countError) {
                countError.textContent = "Please select the number of delegates.";
                countError.classList.remove("hidden");
            }
            if (countGroup) countGroup.classList.add("has-error");
            errorCount += 1;
            if (!firstInvalid) firstInvalid = stepElement.querySelector('input[name="delegateCount"]');
        } else {
            const additional = Number.parseInt(selected.value, 10);
            if (!Number.isFinite(additional)) {
                if (countError) {
                    countError.textContent = "Please select a valid delegation size.";
                    countError.classList.remove("hidden");
                } if (countGroup) countGroup.classList.add("has-error");
                errorCount += 1;
            } else {
                registrationData.totalDelegateCount = additional + 1;
            }
        }
    }

    return { valid: errorCount === 0, count: errorCount, firstInvalid };
}

function validateCurrentStep() {
    const activeStep = document.querySelector(".step.active");
    const result = validateStepElement(activeStep);

    if (!result.valid) {
        showFormSummary(`Please correct the ${result.count} highlighted field${result.count === 1 ? "" : "s"} before continuing.`);
        if (result.firstInvalid) {
            try { result.firstInvalid.focus({ preventScroll: true }); } catch (_) { result.firstInvalid.focus(); }
            result.firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return false;
    }

    hideFormSummary();
    return true;
}

function validateAllRegistrationSteps() {
    for (let index = 0; index <= 5; index += 1) {
        const stepElement = Array.from(steps).find(step => Number(step.dataset.step) === index);
        const result = validateStepElement(stepElement);
        if (!result.valid) {
            showStep(index);
            showFormSummary("Some information is missing or invalid. Please correct the highlighted fields before submitting.");
            if (result.firstInvalid) {
                try { result.firstInvalid.focus({ preventScroll: true }); } catch (_) { result.firstInvalid.focus(); }
                result.firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return false;
        }
    }
    hideFormSummary();
    return true;
}

// Clear a validation warning as the user corrects the corresponding field.
const validationRoot = document.querySelector("main.app") || document;
validationRoot.addEventListener("input", event => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement || control instanceof HTMLTextAreaElement)) return;
    if (!control.closest(".form-group")) return;
    if (!fieldErrorMessage(control)) clearFieldError(control);
});
validationRoot.addEventListener("change", event => {
    const control = event.target;
    if (control?.name === "delegateCount") {
        const countError = document.getElementById("delegateCountError");
        const group = countError?.closest(".form-group");
        if (countError) {
            countError.textContent = "";
            countError.classList.add("hidden");
        }
        if (group && !group.querySelector(".field-error, .content-error")) group.classList.remove("has-error");
        hideFormSummary();
        return;
    }
    if (control && !fieldErrorMessage(control)) clearFieldError(control);
});


/* ============================================================
   SAVE STEP DATA
============================================================ */

function fieldValue(id) {
    const field = document.getElementById(id);
    return field ? String(field.value ?? "").trim() : "";
}

function saveCurrentStepData() {
    if (currentStep === 0) {
        registrationData.advisor = {
            name: fieldValue("advisorName"),
            email: fieldValue("advisorEmail"),
            phone: fieldValue("advisorPhone")
        };
    }

    if (currentStep === 1) {
        registrationData.institution = {
            name: fieldValue("institutionName"),
            city: fieldValue("institutionCity"),
            country: fieldValue("institutionCountry")
        };
    }

    if (currentStep === 2) {
        const selected = document.querySelector('input[name="delegateCount"]:checked');
        if (!selected) throw new Error("Please select the number of delegates.");

        selectedDelegateCount = Number.parseInt(selected.value, 10);
        if (!Number.isFinite(selectedDelegateCount)) throw new Error("Please select a valid delegation size.");

        registrationData.totalDelegateCount = selectedDelegateCount + 1;
        registrationData.delegation = {
            name: fieldValue("delegationName"),
            delegateCount: selectedDelegateCount
        };

        generateDelegateForm();
    }

    if (currentStep === 3) {
        registrationData.headDelegate = {
            name: fieldValue("headName"),
            committee: fieldValue("headCommittee"),
            email: fieldValue("headEmail"),
            phone: fieldValue("headPhone")
        };
    }

    if (currentStep === 4) {
        const delegates = [];
        for (let i = 1; i <= selectedDelegateCount; i += 1) {
            delegates.push({
                name: fieldValue(`delegate${i}Name`),
                email: fieldValue(`delegate${i}Email`),
                phone: fieldValue(`delegate${i}Phone`),
                committee: fieldValue(`delegate${i}Committee`)
            });
        }
        registrationData.delegates = delegates;
    }

    if (currentStep === 5) {
        registrationData.preferences = {
            first: fieldValue("countryPreference1"),
            second: fieldValue("countryPreference2")
        };
    }
}


/* ============================================================
   DYNAMIC DELEGATE FORM
============================================================ */

function createDelegateField(labelText, id, type, placeholder) {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement("input");
    input.type = type;
    input.id = id;
    input.name = id;
    input.placeholder = placeholder;
    input.required = true;

    group.append(label, input);
    return { group, control: input };
}

function createDelegateCommitteeField(id, previousValue = "") {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = "Delegate Committee";

    const select = document.createElement("select");
    select.id = id;
    select.name = id;
    select.required = true;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.hidden = true;
    placeholder.textContent = "Select a committee";
    select.appendChild(placeholder);

    COMMITTEE_OPTIONS.forEach(committee => {
        const option = document.createElement("option");
        option.value = committee;
        option.textContent = committee;
        select.appendChild(option);
    });

    select.value = previousValue || "";
    if (!previousValue) placeholder.selected = true;

    group.append(label, select);
    return { group, control: select };
}

function generateDelegateForm() {
    const container = document.getElementById("delegateFormContainer");
    const description = document.getElementById("delegateStepDescription");
    if (!container) {
        console.error("ACMUN: delegateFormContainer was not found.");
        return;
    }

    // Retain delegate details if the user returns and changes the delegation size.
    const previousValues = {};
    container.querySelectorAll("input, select").forEach(control => {
        previousValues[control.id] = control.value;
    });

    container.replaceChildren();
    if (description) {
        description.textContent = `Please enter the information for all ${selectedDelegateCount} delegates.`;
    }

    for (let i = 1; i <= selectedDelegateCount; i += 1) {
        const section = document.createElement("div");
        section.className = "review-section";
        section.style.marginBottom = "30px";

        const heading = document.createElement("h3");
        heading.textContent = `Delegate ${i}`;
        section.appendChild(heading);

        const name = createDelegateField("Delegate Name", `delegate${i}Name`, "text", "Full name"); const committee = createDelegateCommitteeField(`delegate${i}Committee`, previousValues[`delegate${i}Committee`]);
        const email = createDelegateField("Delegate Email", `delegate${i}Email`, "email", "email@example.com");
        const phone = createDelegateField("Delegate Phone Number", `delegate${i}Phone`, "tel", "+92 ...");

        if (previousValues[name.control.id]) name.control.value = previousValues[name.control.id];
        if (previousValues[email.control.id]) email.control.value = previousValues[email.control.id];
        if (previousValues[phone.control.id]) phone.control.value = previousValues[phone.control.id];

        section.append(name.group, committee.group);

        const contactRow = document.createElement("div");
        contactRow.className = "two-column";
        contactRow.append(email.group, phone.group);
        section.appendChild(contactRow);

        container.appendChild(section);
    }
}


/* ============================================================
   REVIEW PAGE
============================================================ */

function escapeHTML(value) {
    return String(value ?? "—").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function reviewRow(label, value) {
    return `
        <div class="review-row">
            <div class="review-label">${escapeHTML(label)}</div>
            <div class="review-value">${escapeHTML(value || "—")}</div>
        </div>
    `;
}

function createReview() {
    const container = document.getElementById("reviewContainer");
    if (!container) {
        console.error("ACMUN: reviewContainer was not found.");
        return;
    }

    const delegateRows = registrationData.delegates.map((delegate, index) => `
        <div style="padding:15px 0;border-bottom:1px solid #edf1f3;">
            <strong>Delegate ${index + 1}</strong>
            <div style="margin-top:8px;color:#70808a;font-size:14px;line-height:1.7;">
                ${escapeHTML(delegate.name)}<br>
                ${escapeHTML(delegate.committee)}<br>
                ${escapeHTML(delegate.email)}<br>
                ${escapeHTML(delegate.phone)}
            </div>
        </div>
    `).join("");

    container.innerHTML = `
        <div class="review-section">
            <h3>Staff Advisor</h3>
            ${reviewRow("staff_advisor_name", registrationData.advisor.name)}
            ${reviewRow("staff_advisor_email", registrationData.advisor.email)}
            ${reviewRow("staff_advisor_phone", registrationData.advisor.phone)}
        </div>

        <div class="review-section">
            <h3>Institution</h3>
            ${reviewRow("Institution", registrationData.institution.name)}
            ${reviewRow("City", registrationData.institution.city)}
            ${reviewRow("Country", registrationData.institution.country)}
        </div>

        <div class="review-section">
            <h3>Delegation</h3>
            ${reviewRow("Delegation Name", registrationData.delegation.name)}
            ${reviewRow("Total Delegates (including Head Delegate)", registrationData.totalDelegateCount)}
        </div>

        <div class="review-section">
            <h3>Head Delegate</h3>
            ${reviewRow("Name", registrationData.headDelegate.name)}
            ${reviewRow("Committee", registrationData.headDelegate.committee)}
            ${reviewRow("Email", registrationData.headDelegate.email)}
            ${reviewRow("Phone", registrationData.headDelegate.phone)}
        </div>

        <div class="review-section">
            <h3>Delegates</h3>
            ${delegateRows}
        </div>

        <div class="review-section">
            <h3>Country Preferences</h3>
            ${reviewRow("First Preference", registrationData.preferences.first)}
            ${reviewRow("Second Preference", registrationData.preferences.second)}
        </div>
    `;

    if (formSubmissionError) formSubmissionError.hidden = true;
}


/* ============================================================
   SUBMISSION AND NAVIGATION
============================================================ */

function showSubmissionError(message) {
    if (formSubmissionError) {
        formSubmissionError.textContent = message;
        formSubmissionError.hidden = false;
        formSubmissionError.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
        showFormSummary(message);
    }
}

async function submitRegistration() {
    if (submissionInProgress) return;

    // Re-check every required registration step before sending the review.
    if (!validateAllRegistrationSteps()) return;

    if (formSubmissionError) {
        formSubmissionError.textContent = "";
        formSubmissionError.hidden = true;
    }

    submissionInProgress = true;
    if (nextButton) {
        nextButton.disabled = true;
        nextButton.textContent = "Submitting...";
        nextButton.classList.add("submit-loading");
        nextButton.setAttribute("aria-busy", "true");
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData)
        });

        const responseText = await response.text();
        let result = {};
        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch (_) {
            result = { error: responseText || "The server returned an unreadable response." };
        }

        if (!response.ok) {
            const message = typeof result.error === "string"
                ? result.error
                : typeof result.message === "string"
                    ? result.message
                    : `Registration failed (HTTP ${response.status}). Please try again.`;
            throw new Error(message);
        }

        const reference = result.reference || result.registrationReference || "Registration received";
        const referenceElement = document.getElementById("registrationReference");
        if (referenceElement) referenceElement.textContent = reference;

        showStep(7);
    } catch (error) {
        console.error("ACMUN registration submission failed:", error);
        const message = error instanceof TypeError
            ? "Unable to connect to the registration server. Please check the API address and your connection."
            : (error.message || "Registration could not be submitted. Please try again.");
        showSubmissionError(message);
    } finally {
        submissionInProgress = false;
        if (nextButton && currentStep !== 7) {
            nextButton.disabled = false;
            nextButton.textContent = "Submit Registration ✓";
            nextButton.classList.remove("submit-loading");
            nextButton.removeAttribute("aria-busy");
        }
    }
}

if (nextButton) {
    nextButton.addEventListener("click", async event => {
        event.preventDefault();
        if (submissionInProgress) return;

        if (currentStep === 6) {
            await submitRegistration();
            return;
        }

        if (!validateCurrentStep()) return;

        try {
            saveCurrentStepData();
            if (currentStep === 5) createReview();
            showStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            console.error("ACMUN could not continue to the next step:", error);
            showFormSummary(error.message || "This step could not be saved. Please check your entries and try again.");
        }
    });
} else {
    console.error("ACMUN: #nextButton was not found. Check the registration HTML.");
}

if (backButton) {
    backButton.addEventListener("click", event => {
        event.preventDefault();
        if (currentStep > 0 && currentStep <= 6) {
            showStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
} else {
    console.error("ACMUN: #backButton was not found. Check the registration HTML.");
}


/* ============================================================
   INITIALIZE
============================================================ */

showStep(0);
load()
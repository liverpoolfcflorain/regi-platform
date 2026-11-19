
const API_URL = import.meta.env.VITE_ACMUN_API_URL + "/api";

/* ==========================================================
   STATE
========================================================== */

let registrations =
    [];

let currentRegistration =
    null;

let authToken =
    null;


/* ==========================================================
   API HELPER
========================================================== */

// This admin panel uses the backend API directly. Do not require a
// Supabase browser session here unless the frontend has been configured
// to use Supabase authentication.
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
        ? await response.json()
        : { error: await response.text() };

    if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status}). Check the backend API URL and server logs.`);
    }

    return result;
}


/* ==========================================================
   INITIAL LOAD
========================================================== */

async function checkAdminAccess() {
    // Authentication, if enabled on the server, is handled by the backend cookie.
    await loadRegistrations();
}

/* ==========================================================
   LOAD REGISTRATIONS
========================================================== */

async function loadRegistrations() {

    try {

        const result =
            await apiRequest(
                "/registrations"

            );


        // Support the common API response shapes: an array directly,
        // { registrations: [...] }, or { data: [...] }.
        registrations = Array.isArray(result)
            ? result
            : Array.isArray(result.registrations)
                ? result.registrations
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.data?.registrations)
                        ? result.data.registrations
                        : [];


        renderTeams();

        updateStats();

    } catch (error) {

        console.error(
            "Load error:",
            error
        );

        alert(
            error.message ||
            "Unable to load registrations."
        );

    }

}


/* ==========================================================
   STATS
========================================================== */

function updateStats() {

    document
        .getElementById(
            "totalTeams"
        )
        .textContent =
        registrations.length;


    document
        .getElementById(
            "pendingTeams"
        )
        .textContent =
        registrations.filter(

            registration =>
                registration.status !==
                "Completed"

        )
            .length;


    document
        .getElementById(
            "completedTeams"
        )
        .textContent =
        registrations.filter(

            registration =>
                registration.status ===
                "Completed"

        )
            .length;

}


/* ==========================================================
   RENDER TEAM CARDS
========================================================== */

function renderTeams(
    filtered = registrations
) {

    const grid =
        document.getElementById(
            "teamGrid"
        );


    if (
        !filtered.length
    ) {

        grid.innerHTML =
            `

            <div
                class="empty"
                style="grid-column:1/-1;"
            >

                No registrations found.

            </div>

            `;


        return;

    }


    grid.innerHTML =
        `

        <div
            class="team-table-header"
        >

            <div>
                #
            </div>

            <div>
                Delegation
            </div>

            <div>
                Institution
            </div>

            <div>
                Delegates
            </div>

            <div>
                Head Delegate
            </div>

            <div>
                Payment
            </div>

            <div>
                Status
            </div>

            <div>
                Registered
            </div>

        </div>


        ${filtered.map(

            (
                registration,
                index
            ) => {

                const status =
                    registration.status ||
                    "Pending";


                const statusClass =
                    status === "Completed"
                        ? "completed"
                        : "pending";


                return `

                <div

                    class="team-card"

                    data-id="${escapeAttribute(
                    registration.id
                )}"

                >

                    <div
                        class="team-index"
                    >

                        ${String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                )}

                    </div>


                    <div
                        class="
                            team-column
                            team-delegation
                        "
                    >

                        ${escapeHTML(
                    registration
                        .delegation_name
                )}

                    </div>


                    <div
                        class="
                            team-column
                            team-institution
                        "
                    >

                        ${escapeHTML(
                    registration
                        .institution_name
                )}

                    </div>


                    <div
                        class="team-column"
                    >

                        ${registration
                        .number_of_delegates}

                    </div>


                    <div
                        class="
                            team-column
                            team-head
                        "
                    >

                        ${escapeHTML(
                            registration
                                .head_delegate_name
                        )}

                    </div>


                    <div
                        class="
                            team-column
                            team-payment
                        "
                    >

                        ${registration.money ?? 0}

                    </div>


                    <div
                        class="team-column"
                    >

                        <span

                            class="
                                status
                                ${statusClass}
                            "

                        >

                            ${escapeHTML(
                            status
                        )}

                        </span>

                    </div>


                    <div
                        class="
                            team-column
                            team-date
                        "
                    >

                        ${formatDate(
                            registration
                                .created_at
                        )}

                    </div>

                </div>

                `;

            }

        ).join(
            ""
        )}

    `;


    /*
     * ADD CLICK EVENTS
     * WITHOUT INLINE JAVASCRIPT
     */

    grid
        .querySelectorAll(
            ".team-card"
        )
        .forEach(

            card => {

                card
                    .addEventListener(

                        "click",

                        () => {

                            openTeam(
                                card.dataset.id
                            );

                        }

                    );

            }

        );

}


/* ==========================================================
   OPEN TEAM
========================================================== */

async function openTeam(
    id
) {

    try {

        const result =
            await apiRequest(

                `/registrations/${encodeURIComponent(
                    id
                )}`

            );


        currentRegistration =
            result.registration;


        populateEditor();


        document
            .getElementById(
                "teamModal"
            )
            .classList
            .add(
                "open"
            );

    } catch (error) {

        console.error(
            "Open team error:",
            error
        );

        alert(

            error.message ||
            "Unable to load delegates."

        );

    }

}


window.openTeam =
    openTeam;


/* ==========================================================
   POPULATE EDITOR
========================================================== */

function populateEditor() {

    const registration =
        currentRegistration;


    document
        .getElementById(
            "modalTitle"
        )
        .textContent =
        registration.delegation_name ||
        "";


    document
        .getElementById(
            "modalSubtitle"
        )
        .textContent =
        registration.institution_name ||
        "";


    /* Advisor */

    setValue(
        "advisorName",
        registration.staff_advisor_name
    );

    setValue(
        "advisorEmail",
        registration.staff_advisor_email
    );

    setValue(
        "advisorPhone",
        registration.staff_advisor_phone
    );


    /* Institution */

    setValue(
        "institutionName",
        registration.institution_name
    );

    setValue(
        "institutionCity",
        registration.institution_city
    );

    setValue(
        "institutionCountry",
        registration.institution_country
    );


    /* Delegation */

    setValue(
        "delegationName",
        registration.delegation_name
    );
    setValue(
        "delegateCount",
        registration.number_of_delegates
    );


    /* Head Delegate */

    setValue(
        "headName",
        registration.head_delegate_name
    );

    setValue(
        "headCommittee",
        registration.head_delegate_committee
    );

    setValue(
        "headEmail",
        registration.head_delegate_email
    );

    setValue(
        "headPhone",
        registration.head_delegate_phone
    );


    /* Countries */

    setValue(
        "country1",
        registration.country_preference_1
    );

    setValue(
        "country2",
        registration.country_preference_2
    );


    /* Payment */

    setValue(
        "money",
        registration.money ?? 0
    );

    setValue(
        "status",
        registration.status ||
        "Pending"
    );


    /* Deadline */

    if (
        registration.deadline
    ) {

        const date =
            new Date(
                registration.deadline
            );


        const local =
            new Date(

                date.getTime() -

                (
                    date.getTimezoneOffset() *
                    60000
                )

            )

                .toISOString()

                .slice(
                    0,
                    16
                );


        setValue(
            "deadline",
            local
        );

    } else {

        setValue(
            "deadline",
            ""
        );

    }


    renderDelegates(
        registration.delegates || []
    );

}


/* ==========================================================
   RENDER DELEGATES
========================================================== */

function renderDelegates(
    delegates
) {

    const container =
        document.getElementById(
            "delegatesEditor"
        );


    container.innerHTML =
        delegates.map(
            (delegate, index) => `

                <div
                    class="delegate-editor"
                >

                    <h4>
                        Delegate ${index + 1}
                    </h4>


                    <div class="fields">


                        <!-- NAME -->

                        <div class="field">

                            <label>
                                Name
                            </label>

                            <input
                                id="delegate-name-${delegate.id}"

                                value="${escapeAttribute(
                delegate.delegate_name || ""
            )}"
                            >

                        </div>


                        <!-- COMMITTEE -->

                        <div class="field">

                            <label>
                                Committee
                            </label>

                            <input
                                id="delegate-committee-${delegate.id}"

                                value="${escapeAttribute(
                delegate.delegate_committee || ""
            )}"
                            >

                        </div>


                        <!-- ALLOTMENT -->

                        <div class="field">

                            <label>
                                Allotment
                            </label>

                            <input
                                id="delegate-allotment-${delegate.id}"

                                placeholder="e.g. Pakistan"

                                value="${escapeAttribute(
                delegate.allotment || ""
            )}"
                            >

                        </div>


                        <!-- EMAIL -->

                        <div class="field">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"

                                id="delegate-email-${delegate.id}"

                                value="${escapeAttribute(
                delegate.delegate_email || ""
            )}"
                            >

                        </div>


                        <!-- PHONE -->

                        <div class="field">

                            <label>
                                Phone
                            </label>

                            <input
                                id="delegate-phone-${delegate.id}"

                                value="${escapeAttribute(
                delegate.delegate_phone || ""
            )}"
                            >

                        </div>


                    </div>

                </div>

            `
        )
            .join("");

}


/* ==========================================================
   COLLECT REGISTRATION DATA
========================================================== */

function collectRegistrationData() {

    return {

        staff_advisor_name:
            getValue(
                "advisorName"
            ),

        staff_advisor_email:
            getValue(
                "advisorEmail"
            ),

        staff_advisor_phone:
            getValue(
                "advisorPhone"
            ),


        institution_name:
            getValue(
                "institutionName"
            ),

        institution_city:
            getValue(
                "institutionCity"
            ),

        institution_country:
            getValue(
                "institutionCountry"
            ),


        delegation_name:
            getValue(
                "delegationName"
            ),

        number_of_delegates:
            Number(
                getValue(
                    "delegateCount"
                )
            ),


        head_delegate_name:
            getValue(
                "headName"
            ),

        head_delegate_committee:
            getValue(
                "headCommittee"
            ),

        head_delegate_email:
            getValue(
                "headEmail"
            ),

        head_delegate_phone:
            getValue(
                "headPhone"
            ),


        country_preference_1:
            getValue(
                "country1"
            ),

        country_preference_2:
            getValue(
                "country2"
            ),


        money:
            Number(
                getValue(
                    "money"
                )
            ) || 0,


        status:
            getValue(
                "status"
            ),


        deadline:
            getValue(
                "deadline"
            )
                ? new Date(

                    getValue(
                        "deadline"
                    )

                ).toISOString()

                : null

    };

}


/* ==========================================================
   COLLECT DELEGATE DATA
========================================================== */

function collectDelegateData() {

    if (
        !currentRegistration ||
        !Array.isArray(
            currentRegistration.delegates
        )
    ) {

        return [];

    }


    return currentRegistration.delegates

        .map(

            delegate => {

                const id =
                    escapeSelectorValue(
                        delegate.id
                    );


                const nameInput =
                    document.getElementById(
                        `delegate-name-${id}`
                    );


                const committeeInput =
                    document.getElementById(
                        `delegate-committee-${id}`
                    );


                const allotmentInput =
                    document.getElementById(
                        `delegate-allotment-${id}`
                    );

                const emailInput =
                    document.getElementById(
                        `delegate-email-${id}`
                    );


                const phoneInput =
                    document.getElementById(
                        `delegate-phone-${id}`
                    );


                return {

                    id:
                        delegate.id,

                    delegate_name:
                        nameInput
                            ? nameInput.value.trim()
                            : delegate.delegate_name || "",

                    delegate_committee:
                        committeeInput
                            ? committeeInput.value.trim()
                            : delegate.delegate_committee || "",

                    allotment:
                        allotmentInput
                            ? allotmentInput.value.trim()
                            : delegate.allotment || "",

                    delegate_email:
                        emailInput
                            ? emailInput.value.trim()
                            : delegate.delegate_email || "",

                    delegate_phone:
                        phoneInput
                            ? phoneInput.value.trim()
                            : delegate.delegate_phone || ""

                };

            }

        );

}


/* ==========================================================
   SAVE BUTTON
========================================================== */

document
    .getElementById(
        "saveButton"
    )
    .addEventListener(

        "click",

        () =>
            saveChanges(
                false
            )

    );


/* ==========================================================
   COMPLETE BUTTON
========================================================== */

document
    .getElementById(
        "completeButton"
    )
    .addEventListener(

        "click",

        () =>
            saveChanges(
                true
            )

    );


/* ==========================================================
   SAVE CHANGES
========================================================== */

async function saveChanges(
    complete = false
) {

    if (!currentRegistration) {

        return;

    }


    const button =
        complete
            ? document.getElementById(
                "completeButton"
            )
            : document.getElementById(
                "saveButton"
            );


    button.disabled = true;

    button.textContent =
        complete
            ? "Completing..."
            : "Saving...";


    try {

        const registration = {

            staff_advisor_name:
                getValue("advisorName"),

            staff_advisor_email:
                getValue("advisorEmail"),

            staff_advisor_phone:
                getValue("advisorPhone"),


            institution_name:
                getValue("institutionName"),

            institution_city:
                getValue("institutionCity"),

            institution_country:
                getValue("institutionCountry"),


            delegation_name:
                getValue("delegationName"),

            number_of_delegates:
                parseInt(
                    getValue("delegateCount")
                ),


            head_delegate_name:
                getValue("headName"),

            head_delegate_committee:
                getValue("headCommittee"),

            head_delegate_email:
                getValue("headEmail"),

            head_delegate_phone:
                getValue("headPhone"),


            country_preference_1:
                getValue("country1"),

            country_preference_2:
                getValue("country2"),


            money:
                parseFloat(
                    getValue("money")
                ) || 0,


            status:
                complete
                    ? "Completed"
                    : getValue("status"),


            deadline:
                getValue("deadline")
                    ? new Date(
                        getValue("deadline")
                    ).toISOString()
                    : null

        };


        const delegates =
            currentRegistration.delegates.map(
                delegate => {

                    const id =
                        delegate.id;


                    return {

                        id,


                        delegate_name:
                            document
                                .getElementById(
                                    `delegate-name-${id}`
                                )
                                ?.value
                                .trim() || "",


                        delegate_committee:
                            document
                                .getElementById(
                                    `delegate-committee-${id}`
                                )
                                ?.value
                                .trim() || "",


                        allotment:
                            document
                                .getElementById(
                                    `delegate-allotment-${id}`
                                )
                                ?.value
                                .trim() || "",


                        delegate_email:
                            document
                                .getElementById(
                                    `delegate-email-${id}`
                                )
                                ?.value
                                .trim() || "",


                        delegate_phone:
                            document
                                .getElementById(
                                    `delegate-phone-${id}`
                                )
                                ?.value
                                .trim() || ""

                    };

                }
            );


        await apiRequest(
            `/admin/registrations/${encodeURIComponent(currentRegistration.id)}`,
            {
                method: "PUT",
                body: JSON.stringify({ registration, delegates, complete })
            }
        );


        alert(

            complete
                ? "Registration completed and allotment email sent."
                : "Changes saved successfully."

        );


        closeModal();

        await loadRegistrations();


    } catch (error) {

        console.error(
            "SAVE ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to save changes."
        );

    } finally {

        button.disabled = false;

        button.textContent =
            complete
                ? "Complete Registration ✓"
                : "Save Changes";

    }

}



document
    .getElementById(
        "paymentEmailButton"
    )
    .addEventListener(

        "click",

        sendPaymentEmail

    );


async function sendPaymentEmail() {

    if (
        !currentRegistration
    ) {

        return;

    }


    const button =
        document.getElementById(
            "paymentEmailButton"
        );


    const amount =
        parseFloat(
            getValue("money")
        );


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid payment amount first."
        );

        return;

    }


    button.disabled = true;

    button.textContent =
        "Sending...";


    try {
        console.log(currentRegistration.id)
        const response =
            console.log("Payment email route registered");
        console.log(API_URL);
        await fetch(

            `${API_URL}/admin/registrations/${currentRegistration.id}/payment-email`,

            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify({
                        amount
                    })
            }
        );

        alert(
            "Payment email sent successfully."
        );


    } catch (error) {

        console.error(
            "PAYMENT EMAIL ERROR:",
            error
        );

        alert(
            error.message
        );

    } finally {

        button.disabled = false;

        button.textContent =
            "Send Payment Email";

    }

}


/* ==========================================================
   SEARCH
========================================================== */

document
    .getElementById(
        "search"
    )
    .addEventListener(

        "input",

        function () {

            const query =
                this.value

                    .toLowerCase()

                    .trim();


            const filtered =
                registrations.filter(

                    registration => {

                        return [

                            registration
                                .delegation_name,

                            registration
                                .institution_name,

                            registration
                                .head_delegate_name

                        ]

                            .some(

                                value =>

                                    String(
                                        value || ""
                                    )

                                        .toLowerCase()

                                        .includes(
                                            query
                                        )

                            );

                    }

                );


            renderTeams(
                filtered
            );

        }

    );


/* ==========================================================
   MODAL
========================================================== */

function closeModal() {

    document
        .getElementById(
            "teamModal"
        )
        .classList
        .remove(
            "open"
        );


    currentRegistration =
        null;

}


window.closeModal =
    closeModal;


document
    .getElementById(
        "teamModal"
    )
    .addEventListener(

        "click",

        event => {

            if (
                event.target.id ===
                "teamModal"
            ) {

                closeModal();

            }

        }

    );


/* ==========================================================
   HELPERS
========================================================== */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {

        return "";

    }


    return element.value
        .trim();

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {

        return;

    }


    element.value =
        value ?? "";

}


function formatDate(
    date
) {

    if (
        !date
    ) {

        return "-";

    }


    return new Date(
        date
    )

        .toLocaleDateString(

            "en-GB",

            {

                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric"

            }

        );

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(

            /[&<>"']/g,

            character =>
                ({

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"

                })[
                character
                ]

        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/*
 * Keeps IDs consistent when
 * retrieving DOM elements.
 */

function escapeSelectorValue(
    value
) {

    return String(
        value ?? ""
    );

}



checkAdminAccess();
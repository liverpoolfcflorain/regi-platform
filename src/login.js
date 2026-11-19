const API_URL = import.meta.env.VITE_ACMUN_API_URL + "/api";

const form = document.getElementById("loginForm");

if (!form) {
    console.error("Login form #loginForm was not found.");
} else {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (button) {
            button.disabled = true;
            button.textContent = "Signing in...";
        }

        try {
            const email = document
                .getElementById("email")
                .value.trim();

            const password = document
                .getElementById("password")
                .value;

            if (!email || !password) {
                alert("Please enter your email and password.");
                return;
            }

            // Authenticate through the Express backend.
            const loginResponse = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                throw new Error(
                    loginData.message ||
                    loginData.error ||
                    "Invalid email or password."
                );
            }

            // Login successful.
            window.location.replace("/admin.html");

        } catch (error) {
            console.error("Login error:", error);
            alert("Login failed: " + error.message);

        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Login";
            }
        }
    });
}
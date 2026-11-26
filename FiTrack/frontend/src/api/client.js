const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
    const { body, auth = true, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers);
    if (body !== undefined) headers.set("Content-Type", "application/json");

    const token = auth ? localStorage.getItem("fitrack_token") : null;
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...fetchOptions,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (error) {
        throw new Error(`Could not connect to the FiTrack API: ${error.message}`, {
            cause: error,
        });
    }

    const responseText = await response.text();
    let data = null;
    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            if (response.ok) {
                throw new Error("The API returned an invalid JSON response.");
            }
        }
    }

    if (!response.ok) {
        const message = typeof data?.error === "string"
            ? data.error
            : response.status === 502
                ? "The development proxy cannot reach the backend. Start Flask on port 5000."
                : `The API returned HTTP ${response.status}${responseText ? " with a non-JSON response" : " with an empty response"}.`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("The API returned an empty or invalid JSON response.");
    }
    return data;
}

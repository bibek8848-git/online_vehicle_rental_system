// Helper function to handle unauthorized responses
export const handleUnauthorized = (status: number) => {
    if (status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return true;
    }
    return false;
};

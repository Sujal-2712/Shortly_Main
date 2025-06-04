
const storeInSession = (key, value) => {
    if (key && value !== undefined) {
        sessionStorage.setItem(key, JSON.stringify(value));
    }
};

const lockInSession = (key) => {
    const item = sessionStorage.getItem(key);

    try {
        return item ? JSON.parse(item) : null;
    } catch (err) {
        console.error('Failed to parse session item:', err);
        return null;
    }
};

const removeFromSession = (key) => {
    if (key) {
        sessionStorage.removeItem(key);
    }
};

const logoutUser = () => {
    sessionStorage.clear();
};

export {
    storeInSession,
    lockInSession,
    removeFromSession,
    logoutUser
};

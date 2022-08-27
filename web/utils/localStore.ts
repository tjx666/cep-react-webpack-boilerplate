import logger from './logger';

class LocalStore {
    setItem<E>(key: string, value: E): boolean {
        let actionStatus = false;

        if (!key) return actionStatus;

        let jsonString = '';

        try {
            jsonString = JSON.stringify(value);
        } catch (error) {
            logger.error(error);
        }

        if (jsonString) {
            actionStatus = true;
            localStorage.setItem(key, jsonString);
        }

        return actionStatus;
    }

    getItem<E>(key: string): E | null {
        if (!key) return null;

        let data: E | null = null;

        try {
            const jsonString = localStorage.getItem(key) ?? '';
            data = JSON.parse(jsonString) ?? null;
        } catch (error) {
            data = null;
        }

        return data;
    }
}

const localStore = new LocalStore();

export default localStore;

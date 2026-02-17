export type StoreSetter<T> = {
	(partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: false): void;
	(state: T | ((state: T) => T), replace: true): void;
};

export type StoreGetter<T> = () => T;



export function arrayHave<T>(arr: T[], element: T): boolean {
    return arr.indexOf(element) !== -1;
}
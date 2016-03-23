
export declare class FractionType {
    "s": number; // знак
    "n": number; // числитель
    "d": number; // знаменатель

    constructor(a, b?);

    abs(): FractionType;
    neg(): FractionType;
    add(n): FractionType;
    sub(n): FractionType;
    mul(n): FractionType;
    div(n): FractionType;
    pow(exp): FractionType;
    mod(n): FractionType;
    mod(): FractionType;
    gcd(n): FractionType;
    lcm(n): FractionType;
    ceil(places?): FractionType;
    floor(places?): FractionType;
    round(places?): FractionType;
    inverse(): FractionType;
    equals(n);
    compare(n);
    divisible(n);
    divisible(n);
    toString();
    toLatex(excludeWhole: boolean);
    toFraction();
    toFractionType(excludeWhole: boolean);
    toContinued();
    clone();
}